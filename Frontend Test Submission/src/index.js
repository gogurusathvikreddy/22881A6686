import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJnb2d1cnVzYXRodmlrcmVkZHkyMmNtQHN0dWRlbnQudmFyZGhhbWFuLm9yZyIsImV4cCI6MTc1MzY4MTAxNiwiaWF0IjoxNzUzNjgwMTE2LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZDdhNTIwNjMtMzI4Zi00YTg4LTkzZDgtZmNiZTRiNmZkMmRkIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiZ29ndXJ1IHNhdGh2aWsgcmVkZHkiLCJzdWIiOiIyYTc2MjA2MC1lYzg0LTRhZjItOTYyYS1kODI2ZDAzOGRmMmEifSwiZW1haWwiOiJnb2d1cnVzYXRodmlrcmVkZHkyMmNtQHN0dWRlbnQudmFyZGhhbWFuLm9yZyIsIm5hbWUiOiJnb2d1cnUgc2F0aHZpayByZWRkeSIsInJvbGxObyI6IjIyODgxYTY2ODYiLCJhY2Nlc3NDb2RlIjoid1BFZkdaIiwiY2xpZW50SUQiOiIyYTc2MjA2MC1lYzg0LTRhZjItOTYyYS1kODI2ZDAzOGRmMmEiLCJjbGllbnRTZWNyZXQiOiJEa3pQWlFIc0RWZm1yWlJjIn0.Xo890Ow9-fHsi9iEqsEB4vJiLckB08EE-nUVWMMjGDo');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
