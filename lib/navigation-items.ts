import {
  Building2,
  Home,
  HardHat,
  Users,
  MapPin,
  LayoutDashboard,
  Settings,
  Globe,
  UserCog,
  HomeIcon,
  Truck,
  Wrench,
  Map,
  DollarSign,
  Target,
  Package,
  Shield,
  Ruler,
  Tag,
  FileText, 
  Calendar,
  MessageSquare
} from 'lucide-react';
import { NavigationItem } from '../components/layout/Navigation';

export const navigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Sales & Marketing',
    icon: DollarSign,
    href: '/sales_and_marketing',
    children: [
      {
        name: 'Contacts',
        href: '/sales_and_marketing/contacts',
        icon: Users,
      },
      {
        name: 'Customers',
        href: '/sales_and_marketing/customers',
        icon: Users,
      },
      {
        name: 'Opportunities',
        href: '/sales_and_marketing/opportunities',
        icon: Target,
      },
      {
        name: 'Lenders',
        href: '/sales_and_marketing/lenders',
        icon: Building2,
      },
    ],
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: Calendar,
  },
  {
    name: 'Support Tickets',
    href: '/tickets',
    icon: MessageSquare,
  },
  {
    name: 'Purchasing',
    icon: Truck,
    children: [
      {
        name: 'Suppliers',
        href: '/suppliers',
        icon: Truck,
      },
      {
        name: 'Supplier Bids',
        href: '/supplier-bids',
        icon: DollarSign,
      },
      {
        name: 'Supplier Costs',
        href: '/supplier-costs',
        icon: Target,
      },
      {
        name: 'Options Catalog',
        href: '/options',
        icon: Package,
      },
      {
        name: 'Purchase Orders',
        href: '/purchase-orders',
        icon: FileText,
      },
      {
        name: 'PO Groups',
        href: '/po-groups',
        icon: Package,
      },
      {
        name: 'Item Groups',
        href: '/estimating-db-groups',
        icon: Package,
      },
      {
        name: 'Items',
        href: '/estimating-db-items',
        icon: Package,
      },
      {
        name: 'Item PO Group',
        href: '/estimating-db-items-po-index',
        icon: FileText,
      },
    ],
  },
  {
    name: 'Builder Setup',
    icon: Building2,
    children: [
      {
        name: 'Builders',
        href: '/system-setup/builders',
        icon: Building2,
      },
      {
        name: 'Divisions',
        href: '/divisions',
        icon: Building2,
      },
      {
        name: 'Regions',
        href: '/regions',
        icon: Globe,
      },
      {
        name: 'Communities',
        href: '/communities',
        icon: MapPin,
      },
      {
        name: 'Community Phases',
        href: '/community-phases',
        icon: MapPin,
      },
      {
        name: 'Lot Inventory',
        href: '/lot-inventory',
        icon: Map,
      },
      {
        name: 'Jobs',
        href: '/jobs',
        icon: HardHat,
      },
      {
        name: 'Homes',
        href: '/homes',
        icon: Home,
      },
      {
        name: 'Floor Plan Masters',
        href: '/floor-plan-master',
        icon: HomeIcon,
      },
      {
        name: 'Floor Plans',
        href: '/floor-plans',
        icon: HomeIcon,
      },
      {
        name: 'Elevations',
        href: '/elevations',
        icon: Home,
      },
      {
        name: 'Room Master',
        href: '/room-master',
        icon: Home,
      },
    ],
  },
  {
    name: 'System Setup',
    icon: Wrench,
    children: [
      {
        name: 'Assembly Types',
        href: '/system-setup/assembly-types',
        icon: Package,
      },
      {
        name: 'Lot Statuses',
        href: '/system-setup/lot-statuses',
        icon: Map,
      },
      {
        name: 'Unit of Measures',
        href: '/system-setup/unit-of-measures',
        icon: Ruler,
      },
      {
        name: 'Insurance Types',
        href: '/system-setup/insurance-types',
        icon: Shield,
      },
      {
        name: 'Payment Types',
        href: '/system-setup/payment-types',
        icon: DollarSign,
      },
      {
        name: 'Field Labels',
        href: '/system-setup/field-labels',
        icon: Tag,
      },
      {
        name: 'Cost Codes',
        href: '/cost-codes',
        icon: DollarSign,
      },
      {
        name: 'Users',
        href: '/users',
        icon: UserCog,
      },
    ],
  },
  {
    name: 'User Settings',
    href: '/settings',
    icon: Settings,
  },
];