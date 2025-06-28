import React from "react";

const ChatIcon = ({ size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* Blue circular background for contrast */}
    <circle cx="32" cy="32" r="32" fill="#2563eb" />
    {/* Robot Head */}
    <ellipse cx="32" cy="36" rx="26" ry="20" fill="#F4F7FA" />
    {/* Faceplate */}
    <ellipse cx="32" cy="36" rx="18" ry="14" fill="#0A2240" />
    {/* Eyes */}
    <ellipse cx="24" cy="36" rx="4" ry="6" fill="#3EC6FF" />
    <ellipse cx="40" cy="36" rx="4" ry="6" fill="#3EC6FF" />
    {/* Side Ears */}
    <ellipse cx="8" cy="36" rx="6" ry="10" fill="#3EC6FF" />
    <ellipse cx="56" cy="36" rx="6" ry="10" fill="#3EC6FF" />
    {/* Antenna */}
    <rect x="29" y="10" width="6" height="12" rx="3" fill="#2563EB" />
    <circle cx="32" cy="10" r="4" fill="#3EC6FF" stroke="#2563EB" strokeWidth="2" />
    {/* Speech Bubble */}
    <ellipse cx="52" cy="16" rx="12" ry="8" fill="#E5E7EB" />
    <polygon points="56,24 52,24 54,28" fill="#E5E7EB" />
    {/* Dots in Bubble */}
    <circle cx="47" cy="16" r="1.5" fill="#3A4251" />
    <circle cx="52" cy="16" r="1.5" fill="#3A4251" />
    <circle cx="57" cy="16" r="1.5" fill="#3A4251" />
  </svg>
);

export default ChatIcon;
