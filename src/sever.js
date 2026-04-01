require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ DB Connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

main();
