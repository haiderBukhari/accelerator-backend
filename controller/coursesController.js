import mongoose from "mongoose";
import { CourseModel } from "../models/courseModel.js";
import { modulesModel } from "../models/moduleModel.js";
import { bucket } from "../routes/courseRoutes.js";
import { throwError } from "../utils/error.js";

export const addCourse = async (req, res) => {
    try {
        const courseName = req.body.title;
        if (!courseName) {
            throw new Error("courseName is required");
        }
        const data = await CourseModel.create({ title: courseName })
        res.status(200).json({
            message: "Course created successfully",
            course: data
        })
    } catch (err) {
        throwError(res, 400, err.message);
    }
}


export const getCourses = async (req, res) => {
    const {id} = req.query;
    try {
        let courses;
        if(id){
            courses = await CourseModel.find({_id: id}).lean();
        }else{
            courses = await CourseModel.find().lean();
        }
        const courseWithModules = await Promise.all(courses.map(async (course) => {
            const modules = await modulesModel.find({ courseId: course._id }, 'id name views imageLink descriptionShort').lean();
            return {
                id: course._id,
                name: course.title,
                modules: modules.map(module => ({
                    id: module._id,
                    name: module.name,
                    views: module.views,
                    descriptionShort: module.descriptionShort,
                    imageLink: module.imageLink
                }))
            };
        }));

        res.status(200).json({
            courses: courseWithModules
        });
    } catch (err) {
        throwError(res, 400, err.message);
    }
};


export const uploadModule = async (req, res) => {
    try {
        const { courseId, name, descriptionShort, descriptionLong } = req.body;
        if (!courseId || !name || !descriptionLong || !descriptionShort) {
            throw new Error("All Fields are Required");
        }
        const files = req.files;
        if (!files || !files['file'] || !files['file1']) {
            return res.status(400).send('Two files are required: file and file1');
        }

        const file = files['file'][0];
        const file1 = files['file1'][0];

        const fileName = `${Date.now()}_${file.originalname}`;
        const file1Name = `${Date.now()}_${file1.originalname}`;

        const fileUpload = bucket.file(fileName);
        const file1Upload = bucket.file(file1Name);

        await Promise.all([
            fileUpload.save(file.buffer),
            file1Upload.save(file1.buffer),
        ]);

        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        const file1Url = `https://storage.googleapis.com/${bucket.name}/${file1Name}`;

        await modulesModel.create({
            imageLink: fileUrl,
            videoLink: file1Url,
            courseId: courseId,
            name: name,
            descriptionShort: descriptionShort,
            descriptionLong: descriptionLong
        })

        res.status(200).json({
            message: 'Files uploaded successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading files');
    }
};

export const getModule = async (req, res) => {
    try {
        const moduleId = req.params.id;
        if (!moduleId) {
            throw new Error("courseName is required");
        }
        if (!mongoose.isValidObjectId(moduleId)) {
            throw new Error("Invalid moduleId format");
        }
        const data = await modulesModel.findById(moduleId);
        data.views = data.views + 1;
        await data.save();
        res.status(200).json({
            module: data
        })
    } catch (err) {
        throwError(res, 400, err.message);
    }
}