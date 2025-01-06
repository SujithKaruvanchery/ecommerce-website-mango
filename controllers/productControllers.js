const { cloudinaryInstance } = require("../config/cloudinaryConfig");
const ProductDB = require("../models/productModel");

const getProduct = async (req, res) => {
    try {
        const products = await ProductDB.find();
        res.status(200).json(products);
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        console.log("=======productId", productId);
        const product = await ProductDB.findById(productId).populate("seller");
        res.status(200).json({ message: "Product details fetched", data: product });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const createProduct = async (req, res) => {
    try {
        const { title, description, price, image, stockQuantity } = req.body;
        const { id } = req.user;

        console.log("=======req.user", req.user);
        console.log("=======req.file", req.file);

        if (!title || !description || !price || !stockQuantity) {
            return res.status(400).json({ message: "All properties are required" });
        }

        const uploadResult = await cloudinaryInstance.uploader.upload(req.file.path);
        console.log("=======uploadResult", uploadResult);

        const savedProduct = new ProductDB({ title, description, price, stockQuantity, image: uploadResult.url, seller: id });
        await savedProduct.save();

        res.status(200).json({ message: 'Product created successfully', data: savedProduct });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedProduct = await ProductDB.findByIdAndUpdate(productId, req.body, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: 'Product updated successfully', data: updatedProduct });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await ProductDB.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: 'Product deleted successfully', data: deletedProduct });
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
};

const productCategory = async (req, res) => {
    try {
        const { category } = req.params
        console.log("=======category", category)

        const productsCategory = await ProductDB.find({ category })
        console.log("=======productcategory", productsCategory)

        res.status(200).json({ message: 'Product fetched successfully', data: productsCategory });

    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({ error: error.message || "Internal Server Error" });
    }
}

const productNewArrival = async (req, res) => {
    try {

        const newArrivalProduct = await ProductDB.find({ isNewArrival: true });
        console.log("=======newarrivalproduct",newArrivalProduct);
        

        if (!newArrivalProduct || newArrivalProduct.length === 0) {
            return res.status(404).json({ message: 'No new arrivals found' });
        }

        res.status(200).json({ message: 'New arrival products fetched successfully', data: newArrivalProduct });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

module.exports = { getProduct, getProductById, createProduct, deleteProduct, updateProduct , productCategory,productNewArrival};
