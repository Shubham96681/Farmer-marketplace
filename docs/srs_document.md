# Software Requirements Specification (SRS)
## Farm-to-Table Produce App

### 1. Introduction
- **Purpose:** Provide a digital marketplace connecting farmers directly with buyers.
- **Scope:** Farmers list produce, buyers purchase online, admin oversees operations.
- **Definitions:** 
  - *Farmer:* Seller of agricultural products.
  - *Buyer:* Consumer or restaurant ordering products.
  - *Admin:* Verifies farmers, monitors platform.

### 2. Overall Description
- **Product Perspective:** Web application with farmer, buyer, and admin roles.
- **User Characteristics:**
  - Farmers: May have limited digital skills.
  - Buyers: Urban households/restaurants familiar with e-commerce.
- **Constraints:**
  - Internet access required.
  - Mobile-first design is recommended.
  - Payment integration limited to Paystack/Flutterwave at MVP stage.

### 3. Functional Requirements
- **Authentication**
  - Users can register/login.
  - Farmers provide business details.
- **Farmer Features**
  - List products (name, price, quantity, images).
  - Update or remove listings.
  - View order requests.
- **Buyer Features**
  - Browse products by category.
  - Add to cart and checkout.
  - Pay securely via gateway.
- **Admin Features**
  - Verify farmers.
  - Monitor transactions.
  - Remove fraudulent users.
- **Order Management**
  - Farmers accept/reject orders.
  - Buyers receive order updates.

### 4. Non-Functional Requirements
- **Performance:** Handle 500+ concurrent users in MVP.
- **Security:** JWT-based authentication, HTTPS.
- **Scalability:** Deployable to cloud (AWS EC2).
- **Usability:** Mobile-friendly design.

### 5. System Design
- **Frontend:** React.js/JS (static).
- **Backend:** FastAPI (REST APIs).
- **Database:** PostgreSQL (SQLAlchemy ORM).
- **Deployment:** AWS EC2 + GitHub Actions CI/CD.
- **Integration:** Paystack/Flutterwave API for payments.

### 6. Acceptance Criteria
- Farmers can successfully create and update products.
- Buyers can browse, order, and pay online.
- Admin can monitor and verify farmers.
- Orders flow correctly through system.

### 7. Future Enhancements
- Mobile app (Flutter/React Native).
- Delivery tracking integration.
- Farmer performance ratings and reviews.
- USSD support for low-tech farmers.
