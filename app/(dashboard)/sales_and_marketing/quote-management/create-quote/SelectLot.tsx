"use client";
import { useSelector } from "@xstate/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Actor, StateMachine } from "xstate";
import { Typegen } from "@/core/xstate/state-machines/create-quote-machine";
import { AddQuoteState } from "@/core/xstate";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Controls,
  useEdgesState,
  useNodesState,
  addEdge,
  ReactFlowProvider,
} from "reactflow";
// @ts-ignore
import "reactflow/dist/style.css";

import CustomNode from "./CustomNode";
import ImageNode from "./ImageNode";

const nodeTypes = {
  custom: CustomNode,
  image: ImageNode,
};

interface ISelectLotProps {
  quoteActor: Actor<
    StateMachine<
      Typegen["context"],
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any
    >
  >;
}

export const SelectLot = ({ quoteActor }: ISelectLotProps) => {
  const state = useSelector(quoteActor, (snapshot) => snapshot);
  const { lots, selectedCommunity } = state.context;
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>();

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (lots && selectedCommunity) {
      const lotNodes = lots
        .map((lot: any) => {
          if (lot.LotMapXCoordinate && lot.LotMapYCoordinate) {
            return {
              id: lot.LotInventoryID,
              type: "custom",
              zIndex: 1000,
              position: { x: lot.LotMapXCoordinate, y: lot.LotMapYCoordinate },
              data: {
                ...lot,
                send: quoteActor.send,
              },
            };
          }
          return null;
        })
        .filter(Boolean);

      const imageNode = {
        id: `image`,
        type: "image",
        draggable: false,
        position: { x: 0, y: 0 },
        style: {
          backgroundImage: `url(${selectedCommunity?.LotMapImageID})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          height: "100%",
        },
        data: {
          label: "image",
        },
      };
      // console.log(imageNode);
      //@ts-ignore
      setNodes([imageNode, ...lotNodes]);
    }
  }, [lots, selectedCommunity, setNodes, quoteActor.send]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a Lot</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactFlowProvider>
          <div
            className="reactflow-wrapper"
            style={{
              height: 550,
            }}
            ref={reactFlowWrapper}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              maxZoom={2}
              minZoom={0.5}
              fitView
            >
              <Controls />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </CardContent>
    </Card>
  );
};
