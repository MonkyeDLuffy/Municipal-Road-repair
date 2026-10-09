import jwt from 'jsonwebtoken';

const JWT_SECRET = "municipal-road-repair-hackathon-secret-key-2024";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXV6dWtoZ2wwMDAwMXVycWx1eDV3bmVqIiwiZW1wbG95ZWVJZCI6IkFETS0xMDAxIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzkxNDg3MzIxLCJleHAiOjE3OTIwODcxMjF9.sOBeENNONKbeFLa4HAv0CruOIeHheeh7tbDj8o4MLPzdY";

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Decoded:', JSON.stringify(decoded, null, 2));
} catch (error) {
  console.log('Error:', error.message);
}