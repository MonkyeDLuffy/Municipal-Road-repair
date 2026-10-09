import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

console.log('JWT_SECRET from env:', JWT_SECRET ? 'SET (length: ' + JWT_SECRET.length + ')' : 'NOT SET');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXV6dWtoZ2wwMDAwMXVycWx1eDV3bmVqIiwiZW1wbG95ZWVJZCI6IkFETS0xMDAxIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzkxNDg3NzM3LCJleHAiOjE3OTIwOTI1Nzl9.LX1zX1KF-CJw9XeFNaLYNsDNHIMpESG8l8sN2VYxrq8k";

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Decoded:', JSON.stringify(decoded, null, 2));
} catch (error) {
  console.log('Error:', error.message);
}