const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    return res.status(400).json({ message: 'Category already exists' });
  }

  const category = await Category.create({ name });
  res.status(201).json(category);
};

exports.updateCategory = async (req, res) => {
  const { name } = req.body;
  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = name || category.name;
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
};

exports.deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    await category.deleteOne();
    res.json({ message: 'Category removed' });
  } else {
    res.status(404).json({ message: 'Category not found' });
  }
};
