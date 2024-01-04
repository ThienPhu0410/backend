import asyncHandler from "../middleware/asyncHandler.js";

import Product from "../models/productModel.js";



const getProducts = asyncHandler(async (req, res) => {

  const pageSize =process.env.PAGINATION_LIMIT; 

  const page = Number(req.query.pageNumber) || 1;



  const keyword = req.query.keyword

    ? {

        name: {

          $regex: req.query.keyword,

          $options: 'i',

        },

      }

    : {};

  const brand = req.query.brand ? { brand: req.query.brand } : {};

  const category = req.query.category ? { category: req.query.category } : {};

  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;



  const count = await Product.countDocuments({ ...keyword, ...brand, ...category });

  const products = await Product.find({ ...keyword, ...brand, ...category })

    .sort({ price: sortOrder })

    .limit(pageSize)

    .skip(pageSize * (page - 1));



  res.json({ products, page, pages: Math.ceil(count / pageSize) });

});



const getProductsByBrand = asyncHandler(async (req, res) => {

  const pageSize = 10; // Set the page size to 10

  const page = Number(req.query.pageNumber) || 1;

  const brand = req.params.brand;



  const count = await Product.countDocuments({ brand: brand });

  const products = await Product.find({ brand: brand })

    .limit(pageSize)

    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });

});





const getProductsByCategory = asyncHandler(async (req, res) => {

  const pageSize = process.env.PAGINATION_LIMIT;

  const page = Number(req.query.pageNumber) || 1;

  const category = req.params.category;



  const count = await Product.countDocuments({ category: category });

  const products = await Product.find({ category: category })

    .limit(pageSize)

    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize) });

});



const getProductById = asyncHandler(async (req, res) => {

  const product = await Product.findById(req.params.id);



  if (product) {

    res.json(product);

  } else {

    res.status(404);

    throw new Error("Resource not found");

  }

});



const createProduct = asyncHandler(async (req, res) => {

  const product = new Product({

    name: 'Sample name',

    price: 0,

    user: req.user._id,

    image: '/images/sample.jpg',

    brand: 'Sample brand',

    category: 'Sample category',

    countInStock: 0,

    numReviews: 0,

    description: 'Sample description',

    discount: 0,

    specs: [],

  });



  const createdProduct = await product.save();

  res.status(201).json(createdProduct);

});



const updateProduct = async (req, res) => {

  try {

    const {

      name,

      price,

      image,

      brand,

      category,

      description,

      countInStock,

      discount,

      specsInput,

    } = req.body;



    // Assume Product model is your Mongoose model

    const product = await Product.findById(req.params.id);



    if (product) {

      product.name = name;

      product.price = price;

      product.image = image;

      product.brand = brand;

      product.category = category;

      product.description = description;

      product.countInStock = countInStock;

      product.discount = discount;

      product.specs = specsInput; // Ensure specsInput is an array



      const updatedProduct = await product.save();



      res.json(updatedProduct);

    } else {

      res.status(404).json({ message: 'Product not found' });

    }

  } catch (error) {

    res.status(500).json({ message: 'Server Error' });

  }

};

const deleteProduct = asyncHandler(async (req, res) => {

  const product = await Product.findById(req.params.id);



  if (product) {

    await Product.deleteOne({ _id: product._id });

    res.json({ message: "Product removed" });

  } else {

    res.status(404);

    throw new Error("Product not found");

  }

});



const getAllProducts = asyncHandler(async (req, res) => {

  const keyword = req.query.keyword

    ? {

        name: {

          $regex: req.query.keyword,

          $options: 'i',

        },

      }

    : {};

  const brand = req.query.brand ? { brand: req.query.brand } : {};

  const category = req.query.category ? { category: req.query.category } : {};

  const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;



  const products = await Product.find({ ...keyword, ...brand, ...category })

    .sort({ price: sortOrder });



  res.json({ products });

});



const createProductReview = asyncHandler(async (req, res) => {

  const { rating, comment } = req.body;



  const product = await Product.findById(req.params.id);



  if (product) {

    const alreadyReviewed = product.reviews.find(

      (r) => r.user.toString() === req.user._id.toString()

    );

    if (alreadyReviewed) {

      res.status(400);

      throw new Error("Product already reviewed");

    }



    const review = {

      name: req.user.name,

      rating: Number(rating),

      comment,

      user: req.user._id,

    };



    product.reviews.push(review);



    product.numReviews = product.reviews.length;



    product.rating =

      product.reviews.reduce((acc, item) => item.rating + acc, 0) /

      product.reviews.length;



    await product.save();

    res.status(201).json({ message: "Review added" });

  } else {

    res.status(404);

    throw new Error("Product not found");

  }

});



const getTopProducts = asyncHandler(async (req, res) => {

  const products = await Product.find().sort({ rating: -1 }).limit(3);



  res.json(products);

});



export {

  getProducts,

  getProductById,

  createProduct,

  updateProduct,

  deleteProduct,

  createProductReview,

  getTopProducts,
  getProductsByBrand,
  getProductsByCategory,
  getAllProducts

};

