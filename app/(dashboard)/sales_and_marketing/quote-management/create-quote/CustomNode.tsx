"use client";
import { memo, useCallback, useState } from "react";
import { NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LandPlot } from "lucide-react";
import { AddQuoteEvents } from "@/core/xstate";

const CustomNode = ({ data }: NodeProps) => {
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  const handleMouseEnter = () => {
    setIsDetailVisible(true);
  };

  const handleMouseLeave = () => {
    setIsDetailVisible(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        height: "20px",
        width: "20px",
        borderRadius: "50%",
        backgroundColor: data?.LotStatusColor,
        position: "relative",
      }}
    >
      {isDetailVisible && (
        <Card
          className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-64"
          style={{
            transition: "all .3s ease-in-out",
            opacity: isDetailVisible ? 1 : 0,
            visibility: isDetailVisible ? "visible" : "hidden",
          }}
        >
          <CardHeader>
            <CardTitle>{data?.Address1}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <LandPlot className="w-4 h-4 text-indigo-500" />
              <p className="text-sm">{data?.TotalArea} sqft</p>
            </div>
            <p className="text-green-600 text-sm">{data?.LotStatus}</p>
            <p className="text-gray-500 text-xs">{data?.Address2}</p>
            <p className="font-bold text-sm">${data?.PurchasePrice}</p>
            <Button
              size="sm"
              className="w-full mt-4"
              onClick={() => {
                console.log("Proceed clicked", data.LotInventoryID);
                data.send({
                  type: AddQuoteEvents.LOT_SELECTED,
                  payload: { selectedLotId: data.LotInventoryID },
                });
              }}
            >
              Proceed
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

CustomNode.displayName = "CustomNode";

export default memo(CustomNode);
