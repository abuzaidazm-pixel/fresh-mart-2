# FreshMart Local — 💳 Debit/Credit Card 3D Secure Payment Engine & Direct UPI

FreshMart Local is now configured with an interactive **Debit & Credit Card Gateway** backed by an **RBI Two-Factor Authentication (3D Secure / OTP)** authorization flow, alongside **Direct UPI** and **Cash on Delivery**.

---

## 🔒 Strict Payment Verification Guarantee: No Order Confirmed Without Payment!

Orders placed with Debit/Credit Card or UPI **cannot and will not be confirmed** until payment authorization succeeds.

### 💳 1. Debit & Credit Card Payment Flow (Visa, RuPay, Mastercard)
1. **Interactive Card Form**:
   - **Card Number**: 16-digit card input with auto-formatting and automatic brand detection badge (`VISA`, `RUPAY`, `MASTERCARD`).
   - **Cardholder Name**: Name printed on card.
   - **Expiry Date**: `MM/YY` validation.
   - **CVV Code**: 3 or 4-digit security code.
   - **Issuing Bank Selector**: (HDFC Bank, SBI, ICICI Bank, Axis Bank, Kotak, PNB, Bank of Baroda).
   - **Quick Test Buttons**:
     - **Visa Debit**: `4242 4242 4242 4242`
     - **RuPay Debit**: `6521 8934 5612 9012`
     - **Mastercard Credit**: `5324 1823 9081 4455`

2. **Bank 3D Secure / OTP Verification Window**:
   - When clicking **"Pay ₹XXX with Card (3D Secure)"**, all card fields are strictly validated.
   - Opens the official **Bank 3D Secure Modal** showing:
     - Bank Name & Visa / RuPay Verified Badge.
     - Exact charge amount (₹).
     - Notice: *"A 6-digit OTP has been sent to your registered mobile number ending in ****78"*.
     - 6-Digit OTP field (with 1-click **"Auto-Fill Test OTP: 123456"**).
   - **If the user enters the wrong OTP**: The bank declines the authorization, displays an error alert, and **the order is blocked**.
   - **If the user cancels**: Closes the window and **no order is placed**.
   - **When verified with valid OTP**: Authorizes the charge, marks `payment_status: 'paid'`, saves card brand & last 4 digits (e.g. `VISA •••• 4242`), and confirms the order with full receipt and tracking!

---

### ⚡ 2. Direct-to-Bank Instant UPI Payments (GPay, PhonePe, Paytm, BHIM)
- **1-Click Mobile App Buttons**: Deep-links to Google Pay, PhonePe, Paytm, BHIM.
- **Dynamic Real-Time UPI QR Code**: Instant scanning on computer/phone screen.
- **12-Digit UTR Tracking**: Customers can record their UPI UTR reference.

---

### 💵 3. Cash on Delivery (COD)
- Customers selecting COD have their order confirmed with status `PENDING PAYMENT (Pay on Doorstep)`.
- Delivery instructions explain that physical cash or driver UPI QR code can be paid upon arrival.

---

### 🛍️ 4. Customer Dashboard (`/account`)
- **"Payment Options & UPI"** tab displaying all accepted payment methods, store UPI VPA, and bank wire information.
- **"My Orders"** tab displaying payment method badge, payment status (`PAID` or `PENDING`), UTR reference, card last 4 digits, and an interactive **"Pay with UPI"** button for any unpaid orders.

---

## 🚀 Live Testing Instructions:
1. Go to **[http://localhost:3000/checkout](http://localhost:3000/checkout)**.
2. Select **"Debit / Credit Cards"**.
3. Click one of the test cards (e.g. **Visa** or **RuPay**).
4. Click **"Pay ₹XXX with Card (3D Secure)"**.
5. The **Bank 3D Secure OTP Window** will appear.
6. Click **"Auto-Fill Test OTP (123456)"** and tap **"Authorize & Pay"**.
7. The payment is verified, the order is confirmed, and the receipt displays your card brand and last 4 digits!
