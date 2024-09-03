import React, { useState } from "react";

const ColorPicker = ({ pickedColor }) => {
  const [bgColor, setBgColor] = useState("#52206d");

  const handleColorChangee = (event) => {
    setBgColor(event.target.value);
    pickedColor(event.target.value);
  };

  return (
    <>
      <div className="flex">
        <input
          type="color"
          value={bgColor}
          onChange={handleColorChangee}
          title="Choose Color"
          style={{
            cursor: "pointer",
            width: "100%",
            height: "30px",
            border: "none",
            background: "transparent",
          }}
        />
      </div>
    </>
  );
};

export default ColorPicker;
