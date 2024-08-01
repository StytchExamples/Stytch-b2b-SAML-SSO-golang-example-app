import React from "react";

import { FaSpinner } from "react-icons/fa";

interface SpinnerInterface {
  size?: string;
}

const Spinner = (props?: SpinnerInterface) => {
  return (
    <FaSpinner
      size={props?.size}
      className="animate-spin text-2xl text-white-900"
    />
  );
};

export default Spinner;
