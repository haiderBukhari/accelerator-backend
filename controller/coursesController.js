import { CourseModel } from "../models/courseModel.js";
import { throwError } from "../utils/error.js";

export const addCourse = async (req, res) => {
    try{
        const { courseName } = req.body;
        const data = await CourseModel.create({courseName: courseName})
        if (!courseName) {
            throw new Error("Both courseName and courseDescription are required");
        }
        res.status(200).json({
            message: "Course created successfully",
            course: data
        })
    }catch (err) {
        throwError(res, 400, err.message);
    }
}