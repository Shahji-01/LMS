import { Category } from "../models/category.model.js";
import { Course } from "../models/course.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../utils/appError.js";
import { AppResponse } from "../utils/appResponse.js";

/**
 * Get all categories (Publicly accessible for dropdowns/catalogs)
 * @route GET /api/v1/category
 */
export const getCategories = catchAsync(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });
    return res.status(200).json(new AppResponse(200, "Categories fetched.", categories));
});

/**
 * Admin: Create a new category
 * @route POST /api/v1/category
 */
export const createCategory = catchAsync(async (req, res) => {
    const { name, description } = req.body;
    
    if (!name) throw new AppError(400, "Category name is required.");

    const existing = await Category.findOne({ name });
    if (existing) throw new AppError(400, "Category already exists.");

    const category = await Category.create({ name, description });
    return res.status(201).json(new AppResponse(201, "Category created.", category));
});

/**
 * Admin: Update a category
 * @route PUT /api/v1/category/:id
 */
export const updateCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) throw new AppError(404, "Category not found.");

    // If name is changing, we should technically update all courses linking to it.
    // However, Course stores Category as string! Let's update those documents synchronously string-wise.
    if (name && name !== category.name) {
        await Course.updateMany(
            { category: category.name },
            { $set: { category: name } }
        );
        category.name = name;
        category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (description !== undefined) category.description = description;

    await category.save();

    return res.status(200).json(new AppResponse(200, "Category updated.", category));
});

/**
 * Admin: Delete a category
 * @route DELETE /api/v1/category/:id
 */
export const deleteCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) throw new AppError(404, "Category not found.");

    // Check if courses depend on it
    const courseCount = await Course.countDocuments({ category: category.name });
    if (courseCount > 0) {
        throw new AppError(400, `Cannot delete category. ${courseCount} courses are assigned to this category.`);
    }

    await Category.findByIdAndDelete(id);

    return res.status(200).json(new AppResponse(200, "Category deleted."));
});
