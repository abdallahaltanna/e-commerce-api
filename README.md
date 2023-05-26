##### E-commerce-api that contains

1. User auth (register, login, logout, verify email, forget password, reset password)

2. Product (create product when you signed in as admin, get products, get product by id, upload product image using cloudinary, update and delete product)

3. User (get all users when you signed in as admin, show current user, update user profile, get single user, update user password)

4. Review (create a review for specific product, get all reviews, get single review by id, update review, delete review, get product reviews)

5. Order (create order, get order, update order by id when user is finish checkout process and the status will be paid, get all orders when you signed in as admin, get user orders)

6. You can check postman collection

#### Env file contain these variables

1. PORT=""
2. MONGO_URI=""
3. JWT_SECRET=""
4. JWT_LIFETIME=""
5. CLOUDINARY_NAME=""
6. CLOUDINARY_API_KEY=""
7. CLOUDINARY_API_SECRET=""
8. NODE_ENV=""
