"use client";
import { memo } from "react";
import { NodeProps } from "reactflow";

const ImageNode = ({ data }: NodeProps) => {
  return (
    <div
      style={{
        backgroundImage: data.background,
        backgroundPosition: "center",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        width: "100%",
        height: "100%",
      }}
    ></div>
  );
};

ImageNode.displayName = "ImageNode";

export default memo(ImageNode);
