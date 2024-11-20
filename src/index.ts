import { createApp } from "@/server";
import dotenv from 'dotenv';

dotenv.config();


const PORT = process.env.PORT || 8000;

createApp().listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});