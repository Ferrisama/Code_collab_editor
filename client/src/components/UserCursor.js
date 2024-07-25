import React from "react";

function UserCursor({ top, left, color, name }) {
  return (
    <div
      style={{
        position: "absolute",
        top: `${top}px`,
        left: `${left}px`,
        width: "2px",
        height: "20px",
        backgroundColor: color,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20px",
          left: "0",
          backgroundColor: color,
          color: "white",
          padding: "2px 4px",
          borderRadius: "2px",
          fontSize: "12px",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
    </div>
  );
}

export default UserCursor;
