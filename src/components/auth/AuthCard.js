// src/app/(auth)/_components/AuthCard.js
import React from "react";

const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
};

export default AuthCard;
