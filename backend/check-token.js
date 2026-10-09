import jwt from 'jsonwebtoken';

const JWT_SECRET = "municipal-road-repair-hackathon-secret-key-2024";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXV6dWtoZ2wwMDAwMXVycWx1eDV3bmVqIiwiZW1wbG95ZWVJZCI6IkFETS0xMDAxIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzkxNDg2OTYxLCJleHAiOjE3OTIwOTE3NjF9.sOBeENNONKbeFLa4HAv0CruOIeHheeh7tbDj8bdRd6k";

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Decoded:', decoded);
} catch (error) {
  console.log('Error:', error.message);
}