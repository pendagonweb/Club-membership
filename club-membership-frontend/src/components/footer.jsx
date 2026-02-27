import React from "react";

const Footer = () => {
  return (
    <footer className="w-full  text-center text-[12px] py-2 px-9 text-gray-500 border-t">
      © {new Date().getFullYear()}{" "}
     <a
  href="https://pendagon.in/"
  target="_blank"
  rel="noopener noreferrer"
  className="font-medium text-indigo-700 hover:underline hover:text-indigo-900 transition-colors"
>
  Pendagon Technologies
</a>

      . All rights reserved.
    </footer>
  );
};

export default Footer;
