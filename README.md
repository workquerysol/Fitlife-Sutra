## Getting Started

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/harsh661/mern-auth.git
   ```
2. Change into project directory

    ```bash
    cd mern-auth
    ```
3. Install dependencies

    ```bash
    npm install
    ```
4. Rename .env-example to .env and add following content:

    ```js
    NODE_ENV=development
    PORT=3000
    MONGODB_URI=your-mongodb-connection-string
    JWT_SECRET=your-secret-key
    CLIENT_URL=http://localhost:5173
    RESEND_API_KEY=your-resend-api-key
    RESEND_FROM_EMAIL=YourBrand <onboarding@resend.dev>
    ```
5. Start server:

    ```bash
    npm run devStart
    ```

