import jwt from 'jsonwebtoken';

const JWT_SECRET = "municipal-road-repair-hackathon-secret-key-2024";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXV6dWtoZ2wwMDAwMXVycWx1eDV3bmVqIiwiZW1wbG95ZWVJZCI6IkFETS0xMDAxIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzkxNDg4NjA3LCJleHAiOjE3OTIwOTMzMzd9.2EbOhfxkB8P2R1_vo-2jaOelG_qRUT7k8LzR9NzoP44";

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Decoded:', JSON.stringify(decoded, null, 2));
} catch (error) {
  console.log('Error:', error.message);
}