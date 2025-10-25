import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DepositDetailsProps {
  onBack: () => void;
  onSelect: () => void;
}

const deposits = [
  {
    method: "Escrow",
    description: "Escrow",
    amount: 2000.0,
    dateExpected: "10/22/2025",
    received: 200.0,
    dateReceived: "10/22/2025",
    status: "Process Payment",
    paymentType: "Credit Card",
  },
];

const purchaseDetails = [
  { label: "Lot price", sublabel: "120 sqft", value: "Lot Price", address: "55 Gloucester Drive Heidelberg VIC 3084" },
  { label: "Lot Premium", value: "5000" },
  { label: "Floor plan price", sublabel: "Parkville", specs: "50 sqft, 4 bedrooms, 7 bathrooms", value: "Floor Plan Price" },
  { label: "Structural Options", value: "10000" },
  { label: "Bedroom 1 - First Floor", sublabel: "Exposed Brick", value: "5000" },
  { label: "Walk-In Closet", value: "3000" },
];

export const DepositDetails = ({ onBack, onSelect }: DepositDetailsProps) => {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border px-6 py-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Deposit Table */}
        <div className="flex-1 flex flex-col p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 w-64" />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">Deposit Details</h2>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DEPOSIT METHOD</TableHead>
                  <TableHead>DESCRIPTION</TableHead>
                  <TableHead>AMOUNT</TableHead>
                  <TableHead>DATE EXPECTED</TableHead>
                  <TableHead>RECEIVED</TableHead>
                  <TableHead>DATE RECEIVED</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>PAYMENT TYPE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((deposit, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{deposit.method}</TableCell>
                    <TableCell>{deposit.description}</TableCell>
                    <TableCell>{deposit.amount.toFixed(2)}</TableCell>
                    <TableCell>{deposit.dateExpected}</TableCell>
                    <TableCell>{deposit.received.toFixed(2)}</TableCell>
                    <TableCell>{deposit.dateReceived}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{deposit.status}</Badge>
                    </TableCell>
                    <TableCell>{deposit.paymentType}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between p-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select defaultValue="5">
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">1-1 of 1</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Purchase Details */}
        <div className="w-96 border-l border-border flex flex-col">
          <div className="border-b border-border p-4 flex items-center justify-between">
            <h3 className="font-semibold">Purchase Details</h3>
            <div className="flex gap-2">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Deposit
              </Button>
              <Button size="sm" onClick={onSelect}>
                Proceed
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {purchaseDetails.map((detail, index) => (
              <div key={index} className="pb-4 border-b border-border last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{detail.label}</div>
                    {detail.sublabel && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {detail.sublabel}
                      </div>
                    )}
                    {detail.address && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {detail.address}
                      </div>
                    )}
                    {detail.specs && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {detail.specs}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    {detail.value}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-4">
              <div className="text-sm text-muted-foreground">Interior & Exterior Options/Upgrades</div>
              <div className="text-sm text-muted-foreground text-right mt-1">Interior Price</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
