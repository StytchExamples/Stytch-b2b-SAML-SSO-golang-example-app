import React from "react";
import { FaSpinner } from "react-icons/fa";

interface SpinnerInterface {
  size?: string;
  className?: string;
}

const Spinner = (props?: SpinnerInterface) => {
  return (
    <FaSpinner
      size={props?.size}
      className={` text-[#19303d] animate-spin text-2xl ${props?.className}`}
    />
  );
};

export default Spinner;