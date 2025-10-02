// Type-safe database schema definitions based on our PostgreSQL schema

export interface FieldLabel {
  field_label_id: string;
  builder_id: string;
  table_name: string;
  column_name: string;
  custom_label: string;
  placeholder_text?: string | null;
  help_text?: string | null;
  is_visible: boolean;
  is_required?: boolean | null;
  validation_rules?: Record<string, any> | null;
  display_order?: number | null;
  field_group?: string | null;
  created_by?: string | null;
  modified_by?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFieldLabel {
  table_name: string;
  column_name: string;
  custom_label: string;
  placeholder_text?: string;
  help_text?: string;
  is_visible?: boolean;
  is_required?: boolean;
  validation_rules?: Record<string, any>;
  display_order?: number;
  field_group?: string;
}

export interface UpdateFieldLabel extends Partial<CreateFieldLabel> {
  field_label_id: string;
}

export interface Builder {
  builder_id: string;
  builder_name: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  currency: string | null;
  created_date: Date;
  accounting_contact_name: string | null;
  accounting_email: string | null;
  work_phone: string | null;
  mobile_phone: string | null;
  fax: string | null;
  last_billing_date: Date | null;
  db_server: string | null;
  db_name: string | null;
  local_time_zone_name: string;
  geo_location: unknown | null; // PostGIS geometry
  logo_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  user_id: string;
  builder_id: string;
  user_login_id: string;
  password_hash: Buffer | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  email_address: string | null;
  phone: string | null;
  role_id: string;
  po_approval_limit: number | null;
  ap_invoice_entry_limit: number | null;
  ap_variance_limit: number | null;
  ap_invoice_approval_limit: number | null;
  ap_approval_routing_user_id: string | null;
  vpo_approval_limit: number | null;
  vpo_approval_routing_user_id: string | null;
  sales_approval_routing_user_id: string | null;
  sales_associate_user_id: string | null;
  inactive: boolean;
  inactive_date: Date | null;
  salt: string;
  hire_date: Date | null;
  termination_date: Date | null;
  notes: string | null;
  inactive_by: string | null;
  default_region_id: string | null;
  profile_image: string | null;
  password_reset_token: string | null;
  password_reset_expires: Date | null;
  default_grid_page_size: number | null;
  created_at: Date;
  updated_at: Date;
}

// SafeUser type excludes password_hash for client-side use
export type SafeUser = Omit<User, 'password_hash'>;

export interface Division {
  division_id: string;
  builder_id: string;
  division_code: string;
  division_name: string | null;
  logo: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  home_phone: string | null;
  mobile_phone: string | null;
  work_phone: string | null;
  fax: string | null;
  email: string | null;
  date_format: string | null;
  quote_expiry_days: number | null;
  lot_hold_expiry_days: number | null;
  lot_hold_num_of_days: number | null;
  maps_api_key: string | null;
  time_zone_id: string | null;
  business_hours_start: string | null;
  business_hours_end: string | null;
  casl: boolean;
  digital_signature_provider: string | null;
  estimated_close_date_days: number | null;
  is_digital_signature_review_reqd: boolean;
  sort_options_by: string | null;
  external_provider_push_event_url: string | null;
  allow_multiple_quotes_on_lots: boolean;
  sales_manager_id: string | null;
  sage_intacct_entity: string | null;
  sales_tax_rate: number | null;
  accounting_db_id: string | null;
  local_time_zone_name: string | null;
  loan_draw_liability_acct: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Region {
  region_id: string;
  builder_id: string;
  division_id: string; // Now required - regions must belong to a division
  region_code: string;
  description: string | null;
  manager_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Community {
  community_id: string;
  region_id: string;
  builder_id: string;
  division_id?: string | null; // Denormalized from region for query optimization
  community_code: string;
  description: string;
  contract_document_id: string | null;
  change_order_document_id: string | null;
  sage_intacct_entity: string | null;
  sage_intacct_location: string | null;
  sage_intacct_department: string | null;
  sage_intacct_bank_account: string | null;
  wip_account: string | null;
  base_home_revenue_acct: string | null;
  lot_revenue_acct: string | null;
  addendum_option_revenue_acct: string | null;
  change_order_revenue_acct: string | null;
  gst_account: string | null;
  gst_rebate_account: string | null;
  accounting_db_id: string | null;
  sales_manager_id: string | null;
  estimator_id: string | null;
  site_superintendent_id: string | null;
  warranty_rep_id: string | null;
  warranty_job: string | null;
  material_sales_tax_group: string | null;
  labor_sales_tax_group: string | null;
  subcontract_sales_tax_group: string | null;
  other_sales_tax_group: string | null;
  loan_draw_liability_acct: string | null;
  marketing_comments: string | null;
  brochure_file_name: string | null;
  email: string | null;
  logo: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  home_phone: string | null;
  mobile_phone: string | null;
  work_phone: string | null;
  fax: string | null;
  last_po_seq: number | null;
  is_inactive: boolean;
  hoa_id: string | null;
  geo_location: unknown | null; // PostGIS geometry
  lot_map_image_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Job {
  job_id: string;
  region_id: string;
  builder_id: string;
  job_number: string;
  description: string | null;
  community_id: string | null;
  external_system_code: string | null;
  material_sales_tax_group: string | null;
  labor_sales_tax_group: string | null;
  subcontract_sales_tax_group: string | null;
  other_sales_tax_group: string | null;
  site_superintendent_id: string | null;
  project_manager_id: string | null;
  estimator_id: string | null;
  warranty_rep_id: string | null;
  warranty_service_rep_id: string | null;
  schedule_template_id: string | null;
  permit_applied_for_date: Date | null;
  permit_received_date: Date | null;
  permit_released_date: Date | null;
  permit_number: string | null;
  scheduled_start_date: Date | null;
  construction_start_date: Date | null;
  construction_stage: number;
  lot_id: string | null;
  accounting_customer_id: string | null;
  job_type: string | null;
  last_po_seq: number | null;
  community_phase_code: string | null;
  sage_intacct_entity: string | null;
  sage_intacct_location: string | null;
  sage_intacct_department: string | null;
  geo_location: unknown | null; // PostGIS geometry
  created_by: string;
  modified_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface FloorPlan {
  floor_plan_id: string;
  region_id: string;
  community_id: string;
  builder_id: string;
  community_phase_id: string;
  version_number: number;
  series: string;
  floor_plan_assembly_id: string | null;
  description: string | null;
  comments: string | null;
  floor_plan_orientation: string | null;
  num_of_beds: number | null;
  num_of_baths: number | null;
  num_of_garages: number | null;
  main_floor_size: number | null;
  lower_level_size: number | null;
  second_level_size: number | null;
  third_level_size: number | null;
  garage_size: number | null;
  total_size: number | null;
  inactive: boolean;
  inactive_date: Date | null;
  brochure: string | null;
  selling_price: number | null;
  cost: number | null;
  margin: number | null;
  markup: number | null;
  sales_price_sheet: number | null;
  style: string | null;
  is_deleted: boolean;
  last_price_change: Date | null;
  front_length: number | null;
  back_length: number | null;
  left_side_length: number | null;
  right_side_length: number | null;
  internal_notes: string | null;
  schedule_template_id: string | null;
  floor_plan_code: string;
  elevation_code: string;
  elevation_id: string;
  deleted_date: Date | null;
  deleted_by: string | null;
  created_by: string | null;
  modified_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Home {
  home_id: string;
  region_id: string;
  community_id: string;
  builder_id: string;
  community_phase_code: string | null;
  lot_id: string | null;
  floor_plan_id: string | null;
  elevation_id: string | null;
  floor_plan_code: string | null;
  series: string | null;
  elevation_code: string | null;
  floor_plan_price: number | null;
  elevation_price: number | null;
  sales_discount: number | null;
  sales_incentive: number | null;
  lot_price: number | null;
  garage_orientation: string | null;
  exterior_color: string | null;
  sales_incentives: number | null;
  is_estimated: boolean | null;
  estimate_created_date: Date | null;
  job_number: string | null;
  unit_number: string | null;
  schedule_template_id: string | null;
  construction_start_date: Date | null;
  stage_of_construction: number | null;
  lot_info_tooltip: string | null;
  main_floor_size: number | null;
  lower_level_size: number | null;
  second_level_size: number | null;
  third_level_size: number | null;
  garage_size: number | null;
  total_size: number | null;
  internal_sales_commission: number | null;
  realtor_sales_commission: number | null;
  permit_applied_for_date: Date | null;
  permit_received_date: Date | null;
  permit_released_date: Date | null;
  permit_number: string | null;
  scheduled_start_date: Date | null;
  construction_stage: number | null;
  not_available_for_sale: boolean | null;
  release_to_estimating: boolean | null;
  release_to_estimating_by: string;
  release_to_estimating_date: Date;
  project_manager_id: string | null;
  estimator_id: string | null;
  design_center_sales_person_id: string | null;
  addl_premium: number | null;
  sales_person_id: string | null;
  pre_construction_stage: number | null;
  sequence: number;
  floor_plan_assembly_id: string | null;
  elevation_assembly_id: string | null;
  home_type: string | null;
  pre_contract_selection_sheet: string | null;
  post_contract_selection_sheet: string | null;
  description: string | null;
  marketing_info: string | null;
  cancelled_date: Date | null;
  cancelled_by: string | null;
  loan_draws_received: number | null;
  deposits_received: number | null;
  total_closing_adjustments: number | null;
  hoa_id: string | null;
  sales_commission_rate_on_base: number | null;
  sales_commission_rate_on_lot: number | null;
  sales_commission_rate_on_options: number | null;
  created_by: string;
  modified_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  customer_id: string;
  region_id: string;
  builder_id: string;
  accounting_db_id: string | null;
  customer_name: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  cell_phone: string | null;
  email: string | null;
  home_phone: string | null;
  work_phone: string | null;
  company_name: string | null;
  customer_is_a_company: boolean | null;
  accounting_customer_id: string | null;
  inactive: boolean | null;
  created_at: Date;
  updated_at: Date;
}

export interface Option {
  option_id: string;
  region_id: string;
  community_id: string;
  builder_id: string;
  community_phase_id: string | null;
  floor_plan_code: string;
  elevation_code: string;
  option_code: string;
  series: string;
  category_code: string;
  sub_category_code: string;
  unit_of_measure: string | null;
  assembly_id: string | null;
  assembly_type_id: number | null;
  description: string;
  comments: string | null;
  internal_notes: string | null;
  product_number: string | null;
  product_name: string | null;
  product_brand: string | null;
  product_manufacturer: string | null;
  product_style_key: string | null;
  product_style_name: string | null;
  external_option_number: string | null;
  is_included_option: boolean;
  design_center_use_only: boolean;
  price: number | null;
  cost: number | null;
  last_price_change: Date | null;
  sales_price_sheet: number | null;
  inactive: boolean;
  inactive_date: Date | null;
  color_attribute_list_id: string | null;
  color: string | null;
  style_attribute_list_id: string | null;
  style: string | null;
  finish_attribute_list_id: string | null;
  finish: string | null;
  other_attribute_list_id: string | null;
  other: string | null;
  included_at_no_charge: boolean | null;
  select_by_room: boolean | null;
  display_total_only: boolean | null;
  location: string | null;
  main_floor_size: number | null;
  lower_level_size: number | null;
  second_level_size: number | null;
  third_level_size: number | null;
  garage_size: number | null;
  room_size_adjustment: boolean | null;
  construction_stage_cutoff: number | null;
  option_image_icon: string | null;
  warranty_info: string | null;
  total_size: number | null;
  num_of_beds: number | null;
  num_of_baths: number | null;
  num_of_garages: number | null;
  restriction_warning: boolean;
  restriction_message: string | null;
  option_package_id: string | null;
  no_commission_paid: boolean | null;
  markup_percentage: number | null;
  margin_percentage: number | null;
  round_to: number | null;
  warranty_details: string | null;
  warranty_period_in_months: number | null;
  is_deleted: boolean;
  deleted_date: Date | null;
  deleted_by: string | null;
  option_type: number | null;
  created_by: string;
  modified_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Supplier {
  supplier_id: string;
  builder_id: string;
  master_db_supplier_id: string | null;
  accounting_db_id: string | null;
  supplier_code: string;
  supplier_contact_id: string | null;
  supplier_name: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  currency: string | null;
  created_date: Date;
  accounting_contact: string | null;
  accounting_email: string | null;
  work_phone: string | null;
  mobile_phone: string | null;
  fax: string | null;
  is_full_subscriber: boolean;
  full_subscriber_start_date: Date | null;
  supplier_company_email: string | null;
  is_inactive: boolean;
  tax_id_number: string | null;
  is_1099: boolean;
  is_t5018: boolean;
  discount_rate: number | null;
  deduction_rate: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface SupplierContact {
  supplier_contact_id: string;
  supplier_id: string;
  builder_id: string;
  supplier_contact_name: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  created_date: Date;
  email: string | null;
  work_phone: string | null;
  mobile_phone: string | null;
  fax: string | null;
  supplier_contact_login: string | null;
  supplier_contact_password: Buffer | null;
  salt: string | null;
  purchasing_contact: boolean;
  scheduling_contact: boolean;
  warranty_contact: boolean;
  variance_po_contact: boolean;
  accounts_payable_contact: boolean;
  is_inactive: boolean;
  created_at: Date;
  updated_at: Date;
}

// Input types for creating new records (omit generated fields and problematic geo fields)
export type CreateBuilder = Omit<Builder, 'builder_id' | 'created_at' | 'updated_at' | 'geo_location'>;
export type CreateUser = Omit<User, 'user_id' | 'salt' | 'created_at' | 'updated_at'>;
export type CreateRegion = Omit<Region, 'region_id' | 'created_at' | 'updated_at'>;
export type CreateCommunity = Omit<Community, 'community_id' | 'created_at' | 'updated_at' | 'geo_location'>;
export type CreateJob = Omit<Job, 'job_id' | 'created_at' | 'updated_at' | 'geo_location'>;
export type CreateFloorPlan = Omit<FloorPlan, 'floor_plan_id' | 'created_at' | 'updated_at'>;
export type CreateHome = Omit<Home, 'home_id' | 'created_at' | 'updated_at'>;
export type CreateCustomer = Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>;
export type CreateOption = Omit<Option, 'option_id' | 'created_at' | 'updated_at'>;
export type CreateSupplier = Omit<Supplier, 'supplier_id' | 'created_date' | 'created_at' | 'updated_at'>;
export type CreateSupplierContact = Omit<SupplierContact, 'supplier_contact_id' | 'created_date' | 'created_at' | 'updated_at' | 'salt' | 'supplier_contact_password'>;

// Update types (all fields optional except ID)
export type UpdateBuilder = Partial<Omit<Builder, 'builder_id' | 'created_at' | 'geo_location'>> & { builder_id: string };
export type UpdateUser = Partial<Omit<User, 'user_id' | 'created_at'>> & { user_id: string };
export type UpdateRegion = Partial<Omit<Region, 'region_id' | 'created_at'>> & { region_id: string };
export type UpdateCommunity = Partial<Omit<Community, 'community_id' | 'created_at' | 'geo_location'>> & { community_id: string };
export type UpdateJob = Partial<Omit<Job, 'job_id' | 'created_at' | 'geo_location'>> & { job_id: string };
export type UpdateFloorPlan = Partial<Omit<FloorPlan, 'floor_plan_id' | 'created_at'>> & { floor_plan_id: string };
export type UpdateHome = Partial<Omit<Home, 'home_id' | 'created_at'>> & { home_id: string };
export type UpdateCustomer = Partial<Omit<Customer, 'customer_id' | 'created_at'>> & { customer_id: string };
export type UpdateOption = Partial<Omit<Option, 'option_id' | 'created_at'>> & { option_id: string };
export type UpdateSupplier = Partial<Omit<Supplier, 'supplier_id' | 'created_date' | 'created_at'>> & { supplier_id: string };
export type UpdateSupplierContact = Partial<Omit<SupplierContact, 'supplier_contact_id' | 'created_date' | 'created_at' | 'salt'>> & { supplier_contact_id: string };

// New table types added from migration files 006-014

export interface AuthGroup {
  auth_group_id: string;
  builder_id: string;
  group_name: string;
  group_type: string | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserPasswordHistory {
  password_history_id: string;
  builder_id: string;
  user_id: string;
  password_hash: Buffer;
  salt: string;
  changed_at: Date;
  changed_by: string | null;
}

export interface UserSession {
  session_id: string;
  builder_id: string;
  user_id: string;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  last_activity: Date;
  expires_at: Date;
  created_at: Date;
}

export interface CommunityPhase {
  community_phase_id: string;
  builder_id: string;
  region_id: string;
  community_id: string;
  community_phase_code: string;
  phase_description: string | null;
  phase_start_date: Date | null;
  phase_end_date: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Contact {
  contact_id: string;
  builder_id: string;
  contact_type: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  mobile_phone: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Opportunity {
  opportunity_id: string;
  builder_id: string;
  region_id: string;
  community_id: string | null;
  contact_id: string;
  opportunity_name: string;
  opportunity_type: string | null;
  stage: string;
  probability: number | null;
  expected_close_date: Date | null;
  actual_close_date: Date | null;
  amount: number | null;
  currency_code: string | null;
  lead_source: string | null;
  campaign_id: string | null;
  sales_person_id: string | null;
  next_step: string | null;
  description: string | null;
  is_closed: boolean;
  is_won: boolean;
  lost_reason: string | null;
  created_by: string;
  modified_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Lot {
  lot_id: string;
  builder_id: string;
  division_id?: string | null; // Denormalized from region for query optimization
  region_id: string;
  community_id: string;
  community_phase_id: string | null;
  lot_status: string;
  lot: string;
  block: string | null;
  job_number: string | null;
  legal_plan: string | null;
  lot_info_tooltip: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  legal_address: string | null;
  county: string | null;
  country: string | null;
  tract: string | null;
  floor_plan_id: string | null;
  garage_orientation: string | null;
  purchased_from: string | null;
  purchase_price: number | null;
  is_available_for_sale: boolean;
  construction_stage: number;
  lot_selling_price: number | null;
  selling_adjustment: number | null;
  direction_facing: string | null;
  building_floor: string | null;
  unit_number: string | null;
  legal_unit: string | null;
  monthly_hoa_fees: number | null;
  annual_hoa_fees: number | null;
  hoa_id: string | null;
  comments: string | null;
  lot_type: string | null;
  front_length: number | null;
  back_length: number | null;
  left_side_length: number | null;
  right_side_length: number | null;
  exterior_color: string | null;
  rear_lot_id: string | null;
  total_area: number | null;
  useable_area: number | null;
  left_side_lot_id: string | null;
  right_side_lot_id: string | null;
  plat: string | null;
  plat_book: string | null;
  plat_page: string | null;
  facing_lot_id: string | null;
  quote_contract_id: string | null;
  job_costed_value: number | null;
  inventory_home_id: string | null;
  marketing_info: string | null;
  lender_id: string | null;
  loan_draw_template_id: string | null;
  total_loan_amount: number | null;
  loan_draw_lot_payout: number | null;
  home_id: string | null;
  initial_loan_draw: number | null;
  geo_location: any | null;
  lot_map_x_coordinate: number | null;
  lot_map_y_coordinate: number | null;
  // Simplified alias fields for easier API usage
  lot_address: string | null;
  lot_city: string | null;
  lot_state: string | null;
  lot_zip: string | null;
  section: string | null;
  lot_size: number | null;
  lot_cost: number | null;
  lot_price: number | null;
  lot_premium: number | null;
  hoa_fee: number | null;
  tax_rate: number | null;
  school_district: string | null;
  notes: string | null;
  created_by: string;
  modified_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryHomeType {
  inventory_home_type_id: string;
  builder_id: string;
  inventory_home_type: string;
  customized_description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryHome {
  inventory_home_id: string;
  builder_id: string;
  region_id: string;
  community_id: string;
  community_phase_code: string | null;
  lot_id: string | null;
  floor_plan_id: string | null;
  elevation_id: string | null;
  floor_plan_code: string | null;
  series: string | null;
  elevation_code: string | null;
  floor_plan_price: number | null;
  elevation_price: number | null;
  lot_price: number | null;
  garage_orientation: string | null;
  exterior_color: string | null;
  sales_incentives: number | null;
  is_estimated: boolean;
  estimated_date: Date | null;
  job_number: string | null;
  unit_number: string | null;
  schedule_template_id: string | null;
  construction_start_date: Date | null;
  stage_of_construction: number | null;
  lot_info_tooltip: string | null;
  main_floor_size: number | null;
  lower_level_size: number | null;
  second_level_size: number | null;
  third_level_size: number | null;
  garage_size: number | null;
  total_size: number | null;
  permit_applied_for_date: Date | null;
  permit_received_date: Date | null;
  permit_released_date: Date | null;
  permit_number: string | null;
  scheduled_start_date: Date | null;
  construction_stage: number | null;
  not_available_for_sale: boolean;
  release_to_estimating: boolean;
  project_manager_id: string | null;
  estimator_id: string | null;
  design_center_sales_person_id: string | null;
  sales_person_id: string | null;
  addl_premium: number | null;
  pre_construction_stage: number | null;
  floor_plan_assembly_id: string | null;
  elevation_assembly_id: string | null;
  inventory_home_type: string | null;
  pre_contract_selection_sheet: string | null;
  post_contract_selection_sheet: string | null;
  description: string | null;
  marketing_info: string | null;
  home_id: string | null;
  created_by: string;
  modified_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Elevation {
  elevation_id: string;
  builder_id: string;
  region_id: string;
  community_id: string;
  community_phase_id: string;
  floor_plan_code: string;
  series: string;
  elevation_code: string;
  assembly_id: string | null;
  floor_plan_assembly_id: string;
  description: string | null;
  comments: string | null;
  num_of_beds: number | null;
  num_of_baths: number | null;
  num_of_garages: number | null;
  main_floor_size: number | null;
  lower_level_size: number | null;
  second_level_size: number | null;
  third_level_size: number | null;
  garage_size: number | null;
  total_size: number | null;
  selling_price: number | null;
  cost: number | null;
  inactive: boolean;
  inactive_date: Date | null;
  is_deleted: boolean;
  deleted_date: Date | null;
  deleted_by: string | null;
  created_by: string;
  modified_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface OptionCategory {
  option_category_id: string;
  builder_id: string;
  region_id: string;
  option_category_code: string;
  description: string | null;
  margin_percentage: number | null;
  markup_percentage: number | null;
  round_to: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface OptionSubcategory {
  option_subcategory_id: string;
  builder_id: string;
  region_id: string;
  option_category_code: string;
  option_subcategory_code: string;
  description: string | null;
  margin_percentage: number | null;
  markup_percentage: number | null;
  round_to: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface HomeSelection {
  home_selection_id: string;
  builder_id: string;
  for_estimating_purpose_only: boolean;
  inventory_home_id: string | null;
  quote_contract_id: string | null;
  option_id: string | null;
  assembly_id: string | null;
  jc_extra: string | null;
  is_custom: boolean;
  is_require_quote: boolean;
  is_declined_by_builder: boolean;
  declined_reason: string | null;
  is_estimated: boolean;
  estimated_date: Date | null;
  description: string | null;
  comments: string | null;
  internal_notes: string | null;
  option_category_code: string | null;
  option_subcategory_code: string | null;
  quantity: number | null;
  unit_of_measure: string | null;
  price: number | null;
  total: number | null;
  sales_tax: number | null;
  tax_incl_total: number | null;
  is_deleted: boolean;
  deleted_by: string | null;
  deleted_date: Date | null;
  location: string | null;
  room_location: string | null;
  displayed_quantity: number | null;
  displayed_total: number | null;
  color_attribute_list_id: string | null;
  color: string | null;
  style_attribute_list_id: string | null;
  style: string | null;
  finish_attribute_list_id: string | null;
  finish: string | null;
  other_attribute_list_id: string | null;
  other: string | null;
  is_from_inventory_home: boolean;
  selection_response_id: string | null;
  product_number: string | null;
  product_name: string | null;
  product_brand: string | null;
  product_manufacturer: string | null;
  product_style_key: string | null;
  product_style_name: string | null;
  external_option_number: string | null;
  is_included_option: boolean;
  inventory_home_co_master_id: string | null;
  quote_contract_co_master_id: string | null;
  main_floor_size: number | null;
  lower_level_size: number | null;
  second_level_size: number | null;
  third_level_size: number | null;
  garage_size: number | null;
  total_size: number | null;
  num_of_beds: number | null;
  num_of_baths: number | null;
  num_of_garages: number | null;
  select_by_room: boolean;
  display_total_only: boolean;
  room_size_adjustment: number | null;
  financed: boolean;
  financed_amount: number | null;
  pay_by_cash: boolean;
  pay_by_cash_amount: number | null;
  color_attribute_required: boolean;
  style_attribute_required: boolean;
  finish_attribute_required: boolean;
  other_attribute_required: boolean;
  added_by_option_rule: boolean;
  option_rule_option_id: string | null;
  color_other_attribute_list_id: string | null;
  style_other_attribute_list_id: string | null;
  finish_other_attribute_list_id: string | null;
  other_other_attribute_list_id: string | null;
  deposit_expected: number | null;
  deposit_received: number | null;
  date_deposit_received: Date | null;
  deposit_posted_to_accounting: boolean;
  date_deposit_posted_to_accounting: Date | null;
  deposit_posted_by: string | null;
  inventory_homes_selection_id: string | null;
  locked_by_estimating: boolean;
  locked_by_estimating_date: Date | null;
  locked_by_estimating_user_id: string | null;
  option_package_id: string | null;
  color_other: string | null;
  style_other: string | null;
  finish_other: string | null;
  other_other: string | null;
  home_id: string | null;
  cancellation_of_home_selection_id: string | null;
  replacement_of_home_selection_id: string | null;
  ui_caption_notes: string | null;
  home_owner_warranty_details: string | null;
  warranty_period_in_months: number | null;
  serial_number: string | null;
  warranty_start_date: Date | null;
  install_date: Date | null;
  added_from_online_shopping: boolean;
  selection_sub_response1_id: string | null;
  selection_sub_response2_id: string | null;
  created_by: string;
  modified_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuoteContract {
  quote_contract_id: string;
  builder_id: string;
  region_id: string;
  community_id: string | null;
  opportunity_id: string | null;
  lot_id: string | null;
  contract_number: string | null;
  contract_date: Date | null;
  contract_type: string | null;
  status: string | null;
  floor_plan_id: string | null;
  elevation_id: string | null;
  base_price: number | null;
  lot_premium: number | null;
  options_price: number | null;
  total_price: number | null;
  deposit_amount: number | null;
  deposit_received: number | null;
  financing_type: string | null;
  lender_id: string | null;
  sales_person_id: string | null;
  contract_signed_date: Date | null;
  estimated_close_date: Date | null;
  actual_close_date: Date | null;
  created_by: string;
  modified_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PoMaster {
  po_master_id: string;
  builder_id: string;
  region_id: string;
  po_number: string;
  po_date: Date;
  po_index: string;
  description: string | null;
  job_number: string | null;
  unit_number: string | null;
  warranty_job: string | null;
  supplier: string | null;
  builder_supplier_id: string;
  notes: string | null;
  hide_qty: boolean;
  hide_price: boolean;
  total_only: boolean;
  post_to_accounting_batch: number | null;
  post_to_accounting_date: Date | null;
  cancelled: boolean;
  cancellation_sent: boolean;
  cancelled_by: string | null;
  cancelled_date: Date | null;
  cancelled_notes: string | null;
  supplier_cancel_acknowledged_date: Date | null;
  supplier_cancel_acknowledged_user: string | null;
  supplier_cancel_ip_address: string | null;
  delivery_method: string | null;
  delivery_date: Date | null;
  delivery_recipient: string | null;
  delivery_address: string | null;
  re_delivery_method: string | null;
  re_delivery_recipient: string | null;
  re_delivery_date: Date | null;
  re_delivery_address: string | null;
  due_date: Date | null;
  ship_via: string | null;
  fob: string | null;
  discount: number | null;
  terms: string | null;
  ordered_by: string | null;
  completed_date: Date | null;
  approved_for_payment_by: string | null;
  approved_for_payment_date: Date | null;
  next_invoice_seq: number | null;
  is_purch_variance_po: boolean;
  sched_start_date: Date | null;
  sched_finish_date: Date | null;
  retainage_percent: number | null;
  include_documents: boolean;
  viewed_by_supplier: boolean;
  viewed_by_date: Date | null;
  viewed_by_supplier_user_id: string | null;
  is_scheduling_vpo: boolean;
  summarized: boolean;
  supplier_released_to_date: Date | null;
  supplier_acknowledged_date: Date | null;
  supplier_acknowledged_user: string | null;
  supplier_acknowledge_ip_address: string | null;
  supplier_work_complete_date: Date | null;
  supplier_invoice_number: string | null;
  supplier_invoice_date: Date | null;
  status: string;
  pay_point1_schedule_task_id: string | null;
  pay_point2_schedule_task_id: string | null;
  pay_point3_schedule_task_id: string | null;
  pay_point4_schedule_task_id: string | null;
  pay_point5_schedule_task_id: string | null;
  pay_point1_approved_date: Date | null;
  pay_point2_approved_date: Date | null;
  pay_point3_approved_date: Date | null;
  pay_point4_approved_date: Date | null;
  pay_point5_approved_date: Date | null;
  date_sent_to_scheduling: Date | null;
  pay_point1_approved_by: string | null;
  pay_point2_approved_by: string | null;
  pay_point3_approved_by: string | null;
  pay_point4_approved_by: string | null;
  pay_point5_approved_by: string | null;
  scheduling_assigned_supplier_id: string | null;
  is_tbd: boolean;
  is_mpo: boolean;
  vpo_type: string | null;
  vpo_suffix: string | null;
  mpo_received: boolean;
  mpo_received_date: Date | null;
  intacct_jc_tax_line_id: number | null;
  intacct_jc_tax_line_number: number | null;
  intacct_njc_tax_line_id: number | null;
  intacct_njc_tax_line_number: number | null;
  vpo_doc_number: string | null;
  intacct_transaction_type: string | null;
  comments: string | null;
  is_variance: boolean;
  po_gen_batch: number | null;
  po_icon_type: string;
  last_co: number | null;
  variance_po_id: string | null;
  wc_insurance_ok: boolean;
  gl_insurance_ok: boolean;
  lien_waiver_reqd: boolean;
  joint_check_payee_name: string | null;
  schedule_task_id: string | null;
  created_by: string;
  created_at: Date;
}

export interface Lender {
  lender_id: string;
  builder_id: string;
  region_id: string;
  lender_code: string;
  lender_name: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_fax: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  website: string | null;
  notes: string | null;
  is_preferred: boolean;
  is_active: boolean;
  home_phone: string | null;
  mobile_phone: string | null;
  work_phone: string | null;
  fax: string | null;
  email: string | null;
  inactive: boolean;
  allow_loan_draws: boolean;
  created_by: string;
  modified_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface InsuranceType {
  insurance_type_id: string;
  builder_id: string;
  insurance_type: string;
  description: string;
  is_tracking: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface LotStatus {
  lot_status_id: string;
  builder_id: string;
  division_id: string;
  lot_status: string;
  lot_status_custom_desc: string;
  color_code: string | null;
  created_at: Date;
  updated_at: Date;
}

// Create types for new tables
export type CreateAuthGroup = Omit<AuthGroup, 'auth_group_id' | 'created_at' | 'updated_at'>;
export type CreateUserPasswordHistory = Omit<UserPasswordHistory, 'password_history_id'>;
export type CreateUserSession = Omit<UserSession, 'session_id' | 'created_at'>;
export type CreateCommunityPhase = Omit<CommunityPhase, 'community_phase_id' | 'created_at' | 'updated_at'>;
export type CreateContact = Omit<Contact, 'contact_id' | 'created_at' | 'updated_at' | 'is_active'> & {
  is_active?: boolean;
};
export type CreateOpportunity = Omit<Opportunity, 'opportunity_id' | 'created_at' | 'updated_at'>;
export type CreateLot = Omit<Lot, 'lot_id' | 'created_at' | 'updated_at'>;
export type CreateInventoryHomeType = Omit<InventoryHomeType, 'inventory_home_type_id' | 'created_at' | 'updated_at'>;
export type CreateInventoryHome = Omit<InventoryHome, 'inventory_home_id' | 'created_at' | 'updated_at'>;
export type CreateElevation = Omit<Elevation, 'elevation_id' | 'created_at' | 'updated_at'>;
export type CreateOptionCategory = Omit<OptionCategory, 'option_category_id' | 'created_at' | 'updated_at'>;
export type CreateOptionSubcategory = Omit<OptionSubcategory, 'option_subcategory_id' | 'created_at' | 'updated_at'>;
export type CreateHomeSelection = Omit<HomeSelection, 'home_selection_id' | 'created_at' | 'updated_at'>;
export type CreateQuoteContract = Omit<QuoteContract, 'quote_contract_id' | 'created_at' | 'updated_at'>;
export type CreatePoMaster = Omit<PoMaster, 'po_master_id' | 'created_at'>;
export type CreateLender = Omit<Lender, 'lender_id' | 'created_at' | 'updated_at'>;
export type CreateInsuranceType = Omit<InsuranceType, 'insurance_type_id' | 'created_at' | 'updated_at'>;

// Update types for new tables
export type UpdateAuthGroup = Partial<Omit<AuthGroup, 'auth_group_id' | 'created_at'>> & { auth_group_id: string };
export type UpdateUserPasswordHistory = Partial<UserPasswordHistory> & { password_history_id: string };
export type UpdateUserSession = Partial<Omit<UserSession, 'session_id' | 'created_at'>> & { session_id: string };
export type UpdateCommunityPhase = Partial<Omit<CommunityPhase, 'community_phase_id' | 'created_at'>> & { community_phase_id: string };
export type UpdateContact = Partial<Omit<Contact, 'contact_id' | 'created_at'>> & { contact_id: string };
export type UpdateOpportunity = Partial<Omit<Opportunity, 'opportunity_id' | 'created_at'>> & { opportunity_id: string };
export type UpdateLot = Partial<Omit<Lot, 'lot_id' | 'created_at'>> & { lot_id: string };
export type UpdateInventoryHomeType = Partial<Omit<InventoryHomeType, 'inventory_home_type_id' | 'created_at'>> & { inventory_home_type_id: string };
export type UpdateInventoryHome = Partial<Omit<InventoryHome, 'inventory_home_id' | 'created_at'>> & { inventory_home_id: string };
export type UpdateElevation = Partial<Omit<Elevation, 'elevation_id' | 'created_at'>> & { elevation_id: string };
export type UpdateOptionCategory = Partial<Omit<OptionCategory, 'option_category_id' | 'created_at'>> & { option_category_id: string };
export type UpdateOptionSubcategory = Partial<Omit<OptionSubcategory, 'option_subcategory_id' | 'created_at'>> & { option_subcategory_id: string };
export type UpdateHomeSelection = Partial<Omit<HomeSelection, 'home_selection_id' | 'created_at'>> & { home_selection_id: string };
export type UpdateQuoteContract = Partial<Omit<QuoteContract, 'quote_contract_id' | 'created_at'>> & { quote_contract_id: string };
export type UpdatePoMaster = Partial<Omit<PoMaster, 'po_master_id' | 'created_at'>> & { po_master_id: string };
export type UpdateLender = Partial<Omit<Lender, 'lender_id' | 'created_at'>> & { lender_id: string };
export type UpdateInsuranceType = Partial<Omit<InsuranceType, 'insurance_type_id' | 'created_at'>> & { insurance_type_id: string };

// Schedule and Task Management
export interface ScheduleTask {
  schedule_task_id: string;
  builder_id: string;
  schedule_id: string;
  job_number: string | null;
  unit_number: string | null;
  schedule_master_task_id: string;
  user_supplied_code: string | null;
  parent_task_id: string | null;
  index_in_parent: number | null;
  display_level: number | null;
  sort_order: number | null;
  task_type: string | null;
  is_warranty_task: boolean;
  warranty_wo: number | null;
  po_index: string | null;
  pay_point_number: number | null;
  description: string | null;
  is_on_hold: boolean;
  on_hold_by: string | null;
  on_hold_date: Date | null;
  lock_task_dates: boolean;
  locked_by: string | null;
  locked_date: Date | null;
  expected_duration: number | null;
  actual_duration: number | null;
  lag_days: number | null;
  qc_list_id: number | null;
  original_supplier_id: string | null;
  current_supplier_id: string | null;
  internal_resource_id: string | null;
  jc_cost_code: string | null;
  baseline_start: Date | null;
  baseline_finish: Date | null;
  expected_start: Date | null;
  expected_finish: Date | null;
  scheduled_start: Date | null;
  scheduled_finish: Date | null;
  actual_start: Date | null;
  actual_finish: Date | null;
  percent_complete: number;
  comments: string | null;
  completed_date: Date | null;
  completed_by: string | null;
  is_milestone: boolean;
  is_scheduled: boolean;
  is_completed: boolean;
  constraint_type: string | null;
  variance_code: string | null;
  po_payment_approved: boolean;
  variance_notes: string | null;
  created_date: Date;
  modified_date: Date;
}

// Estimating and Costing
export interface EstimatingDBGroup {
  estimating_db_group_id: number;
  builder_id: string;
  region_id: string;
  estimating_db_group: string;
  description?: string;
  is_deleted?: boolean;
  created_date?: Date;
  created_by?: string;
  modified_date?: Date;
  modified_by?: string;
  is_parent_group: boolean;
  parent_code?: string;
  parent_description?: string;
  deleted_date?: Date;
  deleted_by?: string;
}

export interface EstimatingDBItem {
  estimating_db_item_id: string;
  builder_id: string;
  region_id: string;
  estimating_db_group: string;
  estimating_db_item_code: string;
  item_description?: string;
  unit_of_measure?: string;
  conversion_factor?: number;
  child_item_list_id?: string;
  inverse_item_id?: string;
  created_by?: string;
  created_date?: Date;
  modified_by?: string;
  modified_date?: Date;
  
  // Additional fields from original SQL Server schema
  item_id?: string;
  price_link?: number;
  internal_notes?: string;
  po_index?: string;
  jc_cost_code?: string;
  jc_cost_type?: string;
  order_uom?: string;
  takeoff_uom?: string;
  cost_amount?: number;
  tax_group?: string;
  waste_percent?: number;
  round_dir?: number;
  round_to?: number;
  estimating_db_group_sort_order?: number;
  estimating_db_item_sort_order?: number;
  manufacturer_part_number?: string;
  cost_type?: string;
  estimating_db_item_number?: string;
  lump_sum_bid?: boolean;
  use_in_scheduling_vpo?: boolean;
  alt_jc_cost_code?: string;
  alt_jc_cost_type?: string;
  location?: string;
  option_code?: string;
  color?: string;
  option_sub_category?: string;
  retail_pretax?: number;
  inverse_estimating_db_group?: string;
  inverse_estimating_db_item?: string;
  is_deleted?: boolean;
  comments?: string;
  child_item_list_id_alt?: string;
  inactive?: boolean;
  schedule_master_task_id?: string;
  deleted_date?: Date;
  deleted_by?: string;
  option_category_code?: string;
  inverse_item_id_alt?: string;
}

export interface EstimatingDBItemsPOIndex {
  items_po_index_id: number;
  builder_id: string;
  region_id: string;
  po_index: string;
  default_percent?: number;
  estimating_db_item_id: string;
  created_date?: Date;
  modified_date?: Date;
}

export interface AssemblyItem {
  assembly_item_id: string;
  builder_id: string;
  assembly_id: string;
  sequence_no?: number;
  estimating_db_item_id?: string;
  child_item_id?: string;
  sub_child_item_id?: string;
  required_qty?: number;
  waste_percent?: number;
  community_id?: string;
  notes?: string;
  is_active?: boolean;
  created_by?: string;
  created_date?: Date;
  modified_by?: string;
  modified_date?: Date;
}

export interface CostCode {
  cost_code_id: string;
  builder_id: string;
  accounting_db_id: string;
  cost_code: string;
  description: string | null;
  cost_type: string | null;
}

export interface AssemblyMaster {
  assembly_id: string;
  builder_id: string;
  region_id: string;
  assembly_code: string;
  description?: string;
  assembly_type?: string;
  unit_of_measure?: string;
  total_cost?: number;
  total_qty?: number;
  version_number?: number;
  is_current_version?: boolean;
  community_id?: string;
  attribute_list_room_id?: string;
  attribute_list_category_id?: string;
  attribute_list_sub_category_id?: string;
  attribute_list_sub_category2_id?: string;
  attribute_list_series_id?: string;
  attribute_list_brand_id?: string;
  attribute_list_manufacturer_id?: string;
  attribute_list_color_id?: string;
  attribute_list_style_id?: string;
  attribute_list_finish_id?: string;
  attribute_list_material_id?: string;
  attribute_list_room_size_id?: string;
  attribute_list_size_id?: string;
  attribute_list_location_id?: string;
  notes?: string;
  is_active?: boolean;
  created_by?: string;
  created_date?: Date;
  modified_by?: string;
  modified_date?: Date;
}

// Supplier Bidding
export interface SupplierBidMaster {
  supplier_bid_guid: string;
  builder_id: string;
  supplier_bid_id?: number;
  bid_number?: string;
  bid_description?: string;
  bid_status?: string;
  bid_type?: string;
  region_id?: string;
  community_id?: string;
  job_number?: string;
  due_date?: Date;
  bid_instructions?: string;
  original_supplier_bid_guid?: string;
  is_active?: boolean;
  created_by?: string;
  created_date?: Date;
  modified_by?: string;
  modified_date?: Date;
}

export interface SupplierBidAssignment {
  supplier_bid_assignment_guid: string;
  builder_id: string;
  supplier_bid_id?: number;
  supplier_bid_guid: string;
  builder_supplier_id: string;
  assignment_status?: string;
  invite_sent_date?: Date;
  response_date?: Date;
  response_status?: string;
  awarded?: boolean;
  award_date?: Date;
  notes?: string;
  created_by?: string;
  created_date?: Date;
  modified_by?: string;
  modified_date?: Date;
}

export interface SupplierBidPricing {
  supplier_bid_pricing_guid: string;
  builder_id: string;
  supplier_bid_pricing_id?: number;
  supplier_bid_assignment_guid: string;
  region_id?: string;
  community_id?: string;
  estimating_db_item_id?: string;
  assembly_id?: string;
  item_description?: string;
  unit_of_measure?: string;
  quantity?: number;
  unit_cost?: number;
  total_cost?: number;
  markup_percent?: number;
  unit_price?: number;
  total_price?: number;
  notes?: string;
  is_selected?: boolean;
  created_by?: string;
  created_date?: Date;
  modified_by?: string;
  modified_date?: Date;
}

export interface SupplierBidAttachment {
  supplier_bid_attachment_id: string;
  builder_id: string;
  supplier_bid_guid?: string;
  supplier_bid_assignment_guid?: string;
  supplier_bid_pricing_guid?: string;
  attachment_type?: string;
  attachment_name?: string;
  attachment_url?: string;
  attachment_size?: number;
  attached_by?: string;
  attached_date?: Date;
  is_active?: boolean;
}

// Supplier Costs and Insurance
export interface SupplierCost {
  supplier_cost_id: string;
  builder_id: string;
  seq?: number;
  builder_supplier_id: string;
  region_id: string;
  community_id: string;
  community_phase_code?: string;
  floor_plan_code?: string;
  elevation_code?: string;
  option_code?: string;
  version_number?: number;
  estimating_db_item_id?: string;
  unit_of_measure?: string;
  base_cost?: number;
  overhead_percent?: number;
  profit_percent?: number;
  total_cost?: number;
  item_type?: string;
  price_level?: number;
  effective_date?: Date;
  expiration_date?: Date;
  is_active?: boolean;
  notes?: string;
  created_by?: string;
  created_date?: Date;
  modified_by?: string;
  modified_date?: Date;
}

export interface SupplierInsurance {
  supplier_insurance_id: string;
  builder_id: string;
  builders_supplier_id: string;
  insurance_type_id: string;
  region_id: string;
  community_id?: string;
  policy_number?: string;
  policy_start_date?: Date;
  policy_end_date?: Date;
  coverage_amount?: number;
  insurance_company?: string;
  agent_name?: string;
  agent_phone?: string;
  agent_email?: string;
  is_verified?: boolean;
  verified_date?: Date;
  verified_by?: string;
  notes?: string;
  created_date?: Date;
  modified_date?: Date;
}

export interface SupplierPOGroup {
  supplier_po_group_id: string;
  builder_id: string;
  builder_supplier_id: string;
  region_id: string;
  po_group: string;
  description?: string;
  is_active?: boolean;
  created_date?: Date;
  modified_date?: Date;
}

export interface SupplierTaxGroup {
  supplier_tax_group_id: string;
  builder_id: string;
  builders_supplier_id: string;
  community_id: string;
  tax_group_id?: string;
  tax_rate?: number;
  is_active?: boolean;
  created_date?: Date;
  modified_date?: Date;
}

export interface UnitOfMeasure {
  unit_of_measure: string;
  description?: string;
  abbreviation?: string;
  is_active?: boolean;
}

export interface UserCommunity {
  user_id: string;
  community_id: string;
  builder_id: string;
  is_default?: boolean;
  assigned_date?: Date;
  assigned_by?: string;
}

// Create and Update types for new tables
export type CreateScheduleTask = Omit<ScheduleTask, 'schedule_task_id' | 'record_sequence' | 'created_date' | 'modified_date'>;
export type UpdateScheduleTask = Partial<Omit<ScheduleTask, 'schedule_task_id' | 'record_sequence' | 'created_date'>> & { schedule_task_id: string };

export type CreateEstimatingDBGroup = Omit<EstimatingDBGroup, 'estimating_db_group_id' | 'created_date' | 'modified_date'>;
export type UpdateEstimatingDBGroup = Partial<Omit<EstimatingDBGroup, 'estimating_db_group_id' | 'created_date'>> & { estimating_db_group_id: number };

export type CreateEstimatingDBItem = Omit<EstimatingDBItem, 'estimating_db_item_id' | 'created_date' | 'modified_date'>;
export type UpdateEstimatingDBItem = Partial<Omit<EstimatingDBItem, 'estimating_db_item_id' | 'created_date'>> & { estimating_db_item_id: string };

export type CreateEstimatingDBItemsPOIndex = Omit<EstimatingDBItemsPOIndex, 'items_po_index_id' | 'created_date' | 'modified_date'>;
export type UpdateEstimatingDBItemsPOIndex = Partial<Omit<EstimatingDBItemsPOIndex, 'items_po_index_id' | 'created_date'>> & { items_po_index_id: number };

export type CreateAssemblyItem = Omit<AssemblyItem, 'assembly_item_id' | 'created_date' | 'modified_date'>;
export type UpdateAssemblyItem = Partial<Omit<AssemblyItem, 'assembly_item_id' | 'created_date'>> & { assembly_item_id: string };

export type CreateCostCode = Omit<CostCode, 'cost_code_id'>;
export type UpdateCostCode = Partial<CostCode> & { cost_code_id: string };

export type CreateAssemblyMaster = Omit<AssemblyMaster, 'assembly_id' | 'created_date' | 'modified_date'>;
export type UpdateAssemblyMaster = Partial<Omit<AssemblyMaster, 'assembly_id' | 'created_date'>> & { assembly_id: string };

export type CreateSupplierBidMaster = Omit<SupplierBidMaster, 'supplier_bid_guid' | 'supplier_bid_id' | 'created_date' | 'modified_date'>;
export type UpdateSupplierBidMaster = Partial<Omit<SupplierBidMaster, 'supplier_bid_guid' | 'supplier_bid_id' | 'created_date'>> & { supplier_bid_guid: string };

export type CreateSupplierBidAssignment = Omit<SupplierBidAssignment, 'supplier_bid_assignment_guid' | 'supplier_bid_id' | 'created_date' | 'modified_date'>;
export type UpdateSupplierBidAssignment = Partial<Omit<SupplierBidAssignment, 'supplier_bid_assignment_guid' | 'supplier_bid_id' | 'created_date'>> & { supplier_bid_assignment_guid: string };

export type CreateSupplierBidPricing = Omit<SupplierBidPricing, 'supplier_bid_pricing_guid' | 'supplier_bid_pricing_id' | 'created_date' | 'modified_date'>;
export type UpdateSupplierBidPricing = Partial<Omit<SupplierBidPricing, 'supplier_bid_pricing_guid' | 'supplier_bid_pricing_id' | 'created_date'>> & { supplier_bid_pricing_guid: string };

export type CreateSupplierBidAttachment = Omit<SupplierBidAttachment, 'supplier_bid_attachment_id' | 'attached_date'>;
export type UpdateSupplierBidAttachment = Partial<Omit<SupplierBidAttachment, 'supplier_bid_attachment_id' | 'attached_date'>> & { supplier_bid_attachment_id: string };

export type CreateSupplierCost = Omit<SupplierCost, 'supplier_cost_id' | 'seq' | 'created_date' | 'modified_date'>;
export type UpdateSupplierCost = Partial<Omit<SupplierCost, 'supplier_cost_id' | 'seq' | 'created_date'>> & { supplier_cost_id: string };

export type CreateSupplierInsurance = Omit<SupplierInsurance, 'supplier_insurance_id' | 'created_date' | 'modified_date'>;
export type UpdateSupplierInsurance = Partial<Omit<SupplierInsurance, 'supplier_insurance_id' | 'created_date'>> & { supplier_insurance_id: string };

export type CreateSupplierPOGroup = Omit<SupplierPOGroup, 'supplier_po_group_id' | 'created_date' | 'modified_date'>;
export type UpdateSupplierPOGroup = Partial<Omit<SupplierPOGroup, 'supplier_po_group_id' | 'created_date'>> & { supplier_po_group_id: string };

export type CreateSupplierTaxGroup = Omit<SupplierTaxGroup, 'supplier_tax_group_id' | 'created_date' | 'modified_date'>;
export type UpdateSupplierTaxGroup = Partial<Omit<SupplierTaxGroup, 'supplier_tax_group_id' | 'created_date'>> & { supplier_tax_group_id: string };

export type CreateUserCommunity = Omit<UserCommunity, 'assigned_date'>;
export type UpdateUserCommunity = Partial<UserCommunity> & { user_id: string; community_id: string };

// Schedule Management Types
export interface ScheduleMasterQcList {
  qc_list_id: number;
  builder_id: string;
  description: string | null;
  created_date: Date;
  modified_date: Date;
}

export interface ScheduleMasterQcSection {
  qc_section_id: number;
  builder_id: string;
  qc_list_id: number;
  description: string | null;
  sort_order: number | null;
  created_date: Date;
  modified_date: Date;
}

export interface ScheduleMasterQcItem {
  qc_item_id: number;
  builder_id: string;
  qc_section_id: number;
  description: string | null;
  sort_order: number | null;
  created_date: Date;
  modified_date: Date;
}

export interface ScheduleMasterTaskList {
  schedule_master_task_id: string;
  builder_id: string;
  region_id: string;
  description: string | null;
  parent_id: string | null;
  index_in_parent: number | null;
  duration: number | null;
  lag_days: number | null;
  jc_cost_code: string | null;
  qc_list_id: number | null;
  sort_order: number | null;
  display_level: number | null;
  is_milestone: boolean;
  po_index: string | null;
  pay_point_number: number | null;
  notice_lead_time: number | null;
  notification_notes: string | null;
  is_seasonal: boolean;
  construction_stage_cutoff: number | null;
  prompt_user_to_take_photos: boolean;
  visible_to_customer: boolean;
  created_date: Date;
  modified_date: Date;
}

export interface ScheduleTemplate {
  template_id: number;
  builder_id: string;
  region_id: string;
  description: string | null;
  inactive: boolean;
  working_days: number | null;
  calendar_days: number | null;
  start_task_id: string | null;
  finish_task_id: string | null;
  dead_days_calculation_value: number | null;
  rental_dead_days_calculation_value: number | null;
  default_task_id_sort_order: number | null;
  created_date: Date;
  modified_date: Date;
}

export interface ScheduleTemplateTask {
  schedule_master_task_id: string;
  builder_id: string;
  template_id: number;
  user_supplied_code: string | null;
  description: string | null;
  parent_id: string | null;
  index_in_parent: number | null;
  duration: number | null;
  lag_days: number | null;
  jc_cost_code: string | null;
  qc_list_id: number | null;
  sort_order: number | null;
  display_level: number | null;
  is_milestone: boolean;
  is_seasonal: boolean;
  construction_stage_cutoff: number | null;
  prompt_user_to_take_photos: boolean;
  created_date: Date;
  modified_date: Date;
}

export interface ScheduleTemplateTaskConstraint {
  constraint_id: number;
  builder_id: string;
  template_id: number;
  task_id: string;
  predecessor_task_id: string;
  constraint_type: string | null;
  created_date: Date;
  modified_date: Date;
}

export interface ScheduleTemplateNonWorkDay {
  non_work_day_id: number;
  builder_id: string;
  template_id: number;
  working_days: number;
  created_date: Date;
  modified_date: Date;
}

export interface Schedule {
  schedule_id: string;
  builder_id: string;
  region_id: string | null;
  job_number: string | null;
  description: string | null;
  unit_number: string | null;
  quote_contract_id: string | null;
  inventory_home_id: string | null;
  template_id: number;
  baseline_start: Date | null;
  baseline_finish: Date | null;
  expected_start: Date | null;
  expected_finish: Date | null;
  scheduled_start: Date | null;
  scheduled_finish: Date | null;
  actual_start: Date | null;
  actual_finish: Date | null;
  on_hold: boolean;
  on_hold_date: Date | null;
  on_hold_by: string | null;
  closed: boolean;
  inactive: boolean;
  created_by: string | null;
  created_date: Date;
  modified_date: Date;
}


export interface ScheduleTaskConstraint {
  constraint_id: number;
  builder_id: string;
  constraint_type: string;
  schedule_task_id: string;
  predecessor_task_id: string;
  created_date: Date;
  modified_date: Date;
}

export interface ScheduleQcSection {
  qc_section_id: number;
  builder_id: string;
  schedule_task_id: string;
  description: string | null;
  sort_order: number | null;
  created_date: Date;
  modified_date: Date;
}

export interface ScheduleTaskQcItem {
  qc_item_id: number;
  builder_id: string;
  schedule_task_id: string;
  qc_section_id: number;
  description: string | null;
  comments: string | null;
  sort_order: number | null;
  completed: boolean;
  completed_date: Date | null;
  completed_by: string | null;
  has_attachments: boolean;
  created_date: Date;
  modified_date: Date;
}

export interface ScheduleTaskActivityLog {
  task_activity_log_id: number;
  builder_id: string;
  schedule_task_id: string | null;
  po_number: string | null;
  entry_type: string | null;
  point_of_origin: number;
  builder_user_id: string | null;
  builders_supplier_id: string | null;
  supplier_user_name: string | null;
  builder_comments: string | null;
  builder_comment_date: Date | null;
  supplier_comments: string | null;
  supplier_comment_date: Date | null;
  created_by: string | null;
  created_date: Date;
  hide_on_supplier_portal: boolean;
  modified_date: Date;
}

export interface ScheduleTaskHistoryLog {
  task_history_log_id: number;
  builder_id: string;
  schedule_task_id: string;
  log_date: Date | null;
  log_entry_type: string | null;
  action: string | null;
  log_notes: string | null;
  builder_user_id: string | null;
  supplier_status: string | null;
  builder_status: string | null;
  supplier_user_id: string | null;
  created_date: Date;
  modified_date: Date;
}

export interface ScheduleTaskNotification {
  notification_id: number;
  builder_id: string;
  schedule_task_id: string | null;
  builders_supplier_id: string | null;
  delivery_method_id: number | null;
  delivery_address: string | null;
  delivery_date: Date | null;
  current_start: Date | null;
  current_finish: Date | null;
  previous_start: Date | null;
  previous_finish: Date | null;
  notification_type_id: number | null;
  created_by: string | null;
  created_date: Date;
  hide_on_supplier_portal: boolean;
  modified_date: Date;
}

export interface SchedulingNonWorkingDay {
  row_sequence: number;
  builder_id: string;
  region_id: string;
  non_working_date: Date | null;
  recurring_month: number | null;
  recurring_day: number | null;
  is_working_day: boolean;
  job_number: string | null;
  created_date: Date;
  modified_date: Date;
}

export interface SchedulingWorkingDay {
  working_day_id: number;
  builder_id: string;
  region_id: string;
  day_of_week: number;
  created_date: Date;
  modified_date: Date;
}

// Assembly Component Types
export interface AssemblyType {
  assembly_type_id: number;
  description: string | null;
  created_date: Date;
  modified_date: Date;
}

export interface AssemblyComponent {
  component_id: number;
  builder_id: string;
  parent_assembly_id: string;
  component_assembly_id: string;
  qty: number | null;
  sort_order: number | null;
  use_parent_assembly_qty: boolean;
  is_deleted: boolean;
  created_date: Date;
  modified_date: Date;
}

export interface AssemblyIntersection {
  intersect_id: number;
  builder_id: string;
  region_id: string;
  description: string;
  created_date: Date;
  modified_date: Date;
}

export interface AssemblyIntersectAssembly {
  intersect_assembly_id: number;
  builder_id: string;
  intersect_id: number;
  assembly_id: string;
  created_date: Date;
  modified_date: Date;
}

export interface AssemblyIntersectItem {
  item_id: number;
  builder_id: string;
  intersect_id: number;
  assembly_id: string;
  po_index: string;
  takeoff_qty: number;
  takeoff_uom: string | null;
  conversion_factor: number | null;
  order_qty: number | null;
  order_uom: string | null;
  notes: string | null;
  estimating_db_item_id: string;
  created_date: Date;
  modified_date: Date;
}

export interface AssemblySalesPricing {
  pricing_id: number;
  builder_id: string;
  assembly_id: string;
  community_id: string;
  community_phase_id: string;
  assembly_type_id: number;
  floor_plan_code: string;
  elevation_code: string;
  option_code: string;
  series: string | null;
  category_code: string | null;
  sub_category_code: string | null;
  unit_of_measure: string | null;
  description: string;
  comments: string | null;
  cost_basis_type: number | null;
  price: number | null;
  construction_cost: number | null;
  land_cost: number | null;
  commission_cost: number | null;
  last_price_change: Date | null;
  sales_price_sheet: number | null;
  inactive: boolean;
  inactive_date: Date | null;
  color_attribute_list_id: string | null;
  style_attribute_list_id: string | null;
  finish_attribute_list_id: string | null;
  other_attribute_list_id: string | null;
  included_at_no_charge: boolean;
  select_by_room: boolean;
  display_total_only: boolean;
  location: string | null;
  main_floor_size: number | null;
  lower_level_size: number | null;
  second_level_size: number | null;
  third_level_size: number | null;
  garage_size: number | null;
  room_size_adjustment: boolean;
  construction_stage_cutoff: number | null;
  warranty_info: string | null;
  created_date: Date;
  created_by: string;
  modified_date: Date;
  modified_by: string;
  total_size: number | null;
  num_of_beds: number | null;
  num_of_baths: number | null;
  num_of_garages: number | null;
  restriction_warning: boolean;
  restriction_message: string | null;
  option_package_id: string | null;
  no_commission_paid: boolean;
  margin_percentage: number | null;
  round_to: number | null;
  warranty_details: string | null;
  warranty_period_in_months: number | null;
  is_deleted: boolean;
  deleted_date: Date | null;
  deleted_by: string | null;
  is_published: boolean;
  published_date: Date | null;
  published_by: string | null;
}

// PO and Financial Types
export interface CostCodeType {
  cost_code_type: number;
  cost_code_type_name: string;
  created_date: Date;
  modified_date: Date;
}

export interface PaymentType {
  payment_type_id: string;
  description: string;
  created_date: Date;
  modified_date: Date;
}

export interface TaxGroup {
  tax_group_id: number;
  builder_id: string;
  region_id: string;
  community_id: string;
  tax_group: string;
  description: string;
  njc_rate: number | null;
  jc_rate: number | null;
  created_date: Date;
  modified_date: Date;
}

export interface POGroup {
  po_group_id: number;
  builder_id: string;
  region_id: string;
  po_group: string;
  description: string | null;
  notes: string | null;
  jc_cost_code: string | null;
  jc_cost_type: string | null;
  forecast_percent_1: number | null;
  forecast_percent_2: number | null;
  forecast_percent_3: number | null;
  forecast_percent_4: number | null;
  forecast_percent_5: number | null;
  forecast_percent_6: number | null;
  forecast_percent_7: number | null;
  forecast_percent_8: number | null;
  forecast_percent_9: number | null;
  forecast_percent_10: number | null;
  forecast_percent_11: number | null;
  forecast_percent_12: number | null;
  compounding_forecasts: boolean;
  standard_text: string | null;
  po_release_group: string | null;
  hide_qty: boolean;
  hide_price: boolean;
  total_only: boolean;
  po_report_format: string | null;
  payment_term: number | null;
  fob: string | null;
  ship_via: string | null;
  terms: string | null;
  retainage_percent: number | null;
  po_type: string | null;
  pay_point_1_percent: number | null;
  pay_point_2_percent: number | null;
  pay_point_3_percent: number | null;
  pay_point_4_percent: number | null;
  pay_point_5_percent: number | null;
  pay_point_1_sched_task: number | null;
  pay_point_2_sched_task: number | null;
  pay_point_3_sched_task: number | null;
  pay_point_4_sched_task: number | null;
  pay_point_5_sched_task: number | null;
  requires_payment_approval: boolean;
  mpo: boolean;
  use_in_scheduling: boolean;
  require_lien_release: boolean;
  schedule_master_task_id: string | null;
  master_task_id_for_release: string | null;
  is_deleted: boolean;
  created_by: string | null;
  created_date: Date;
  modified_by: string | null;
  modified_date: Date;
}

export interface PoSequentialNumber {
  po_sequential_id: number;
  builder_id: string;
  tstmp: Date;
  po_number: number;
}

export interface PoItem {
  po_items_id: string;
  builder_id: string;
  po_master_id: string;
  region_id: string;
  po_number: string;
  po_item_seq: number;
  line_number: number | null;
  line_description: string | null;
  description: string | null;
  comments: string | null;
  mpo_qty: number | null;
  order_qty: number | null;
  order_uom: string | null;
  approved_co_qty: number | null;
  takeoff_qty: number | null;
  takeoff_uom: string | null;
  rate: number | null;
  pretax: number | null;
  approved_co_pretax: number | null;
  tax_group: string | null;
  jc_tax: number | null;
  jc_tax_approved_co: number | null;
  jc_tax_rate: number | null;
  njc_tax: number | null;
  njc_tax_approved_co: number | null;
  njc_tax_rate: number | null;
  dont_print: boolean;
  job_number: string | null;
  unit_number: string | null;
  jc_extra: string | null;
  jc_cost_code: string | null;
  jc_cost_type: string | null;
  est_item_id: number;
  gen_batch: number | null;
  sort_order: number | null;
  part_number: string | null;
  variance_jc_cost_type: string | null;
  variance_pretax: number | null;
  variance_jc_tax: number | null;
  variance_njc_tax: number | null;
  variance_line_number: number | null;
  external_id: string | null;
  po_index: string;
  approved_for_payment_date: Date | null;
  approved_for_payment_by: string | null;
  pay_point_number: number | null;
  home_selection_id: string | null;
  inventory_home_id: string | null;
  quote_contract_id: string | null;
  created_date: Date;
  child_item_list_id: string | null;
  child_item_id: string | null;
  child_item_rate: number | null;
  sub_child_list_id: string | null;
  sub_child_item_id: string | null;
  sub_child_item_rate: number | null;
  estimating_db_item_id: string | null;
  schedule_task_id: string | null;
  co_adjusted_rate: number | null;
  co_adjusted_pretax: number | null;
  co_adjusted_jc_tax: number | null;
  co_adjusted_njc_tax: number | null;
  warranty_deficiency_id: number | null;
  sage_intacct_item: string | null;
  modified_date: Date;
}

export interface PoItemsCo {
  po_items_co_id: string;
  builder_id: string;
  po_master_co_id: string;
  po_items_id: string;
  po_item_co_seq: number;
  line_number: number | null;
  line_description: string | null;
  description: string | null;
  comments: string | null;
  mpo_qty: number | null;
  order_qty: number | null;
  order_uom: string | null;
  rate: number | null;
  pretax: number | null;
  approved_co_pretax: number | null;
  tax_group: string | null;
  jc_tax: number | null;
  jc_tax_approved_co: number | null;
  jc_tax_rate: number | null;
  njc_tax: number | null;
  njc_tax_approved_co: number | null;
  njc_tax_rate: number | null;
  dont_print: boolean;
  job_number: string | null;
  unit_number: string | null;
  jc_extra: string | null;
  jc_cost_code: string | null;
  jc_cost_type: string | null;
  estimating_db_item_id: string | null;
  est_item_id: number;
  gen_batch: number | null;
  sort_order: number | null;
  part_number: string | null;
  variance_jc_cost_type: string | null;
  variance_pretax: number | null;
  variance_jc_tax: number | null;
  variance_njc_tax: number | null;
  variance_line_number: number | null;
  external_id: string | null;
  po_index: string;
  approved_for_payment_date: Date | null;
  approved_for_payment_by: string | null;
  pay_point_number: number | null;
  home_selection_id: string | null;
  inventory_home_id: string | null;
  quote_contract_id: string | null;
  created_date: Date;
  child_item_list_id: string | null;
  child_item_id: string | null;
  sub_child_list_id: string | null;
  sub_child_item_id: string | null;
  sub_child_item_description: string | null;
  child_item_rate: number | null;
  sub_child_item_rate: number | null;
  sage_intacct_item: string | null;
  modified_date: Date;
}

export interface PoCorrespondence {
  correspondence_id: number;
  builder_id: string;
  po_master_id: string;
  builder_supplier_id: string | null;
  supplier_contact_id: string | null;
  builders_user_id: string | null;
  date_logged: Date;
  sequence: number;
  comments: string | null;
  response_to_sequence: number;
  document_id: string | null;
  ip_address: string | null;
  geo_location: unknown | null; // PostGIS geometry
  created_date: Date;
  modified_date: Date;
}

export interface PoViewingHistory {
  viewing_history_id: number;
  builder_id: string;
  po_master_id: string | null;
  builder_supplier_id: string | null;
  supplier_contact_id: string | null;
  date_viewed: Date;
  viewing_ip_address: string | null;
  viewing_geo_location: unknown | null; // PostGIS geometry
  created_date: Date;
}

export interface VariancePo {
  variance_po_id: string;
  builder_id: string;
  region_id: string;
  schedule_id: string | null;
  vpo_request_date: Date | null;
  po_index: string | null;
  builders_supplier_id: string | null;
  description: string | null;
  comments: string | null;
  po_number: string | null;
  sequence: number;
  status: string | null;
  schedule_master_task_id: string | null;
  schedule_task_id: string | null;
  accounting_db_id: string | null;
  vpo_reason: string | null;
  vpo_notes: string | null;
  vpo_budget: number | null;
  start_date: Date | null;
  lead_time: number | null;
  duration: number | null;
  supplier_comments: string | null;
  approved_by: string | null;
  date_sent: Date | null;
  date_received: Date | null;
  date_approved: Date | null;
  date_declined: Date | null;
  back_charge_builder_supplier_id: string | null;
  back_charge_comments: string | null;
  purchaser_id: string | null;
  internal_comments: string | null;
  show_internal_comments: boolean;
  delivery_date: Date | null;
  sent_to_vendor_by: string | null;
  delivery_address: string | null;
  created_by: string | null;
  created_date: Date;
  create_schedule_task: boolean;
  is_seasonal: boolean;
  declined_by: string | null;
  po_master_id: string | null;
  modified_date: Date;
}

export interface PostingBatch {
  batch_id: number;
  builder_id: string;
  region_id: string;
  batch_type: string;
  batch_date: Date | null;
  created_by: string;
  posting_date: Date | null;
  posting_status: string | null;
  posting_data_sent: string | null;
  posting_data_response: string | null;
  repost_batch_id: number | null;
  created_date: Date;
  modified_date: Date;
}

export interface UserRole {
  role_id: string;
  description: string;
  admin_role?: boolean;
  sales_person_role?: boolean;
  sales_manager_role?: boolean;
  sales_associate_role?: boolean;
  design_center_role?: boolean;
  estimating_role?: boolean;
  purchasing_role?: boolean;
  accounting_role?: boolean;
  site_superintendent_role?: boolean;
  warranty_tech_role?: boolean;
  warranty_admin_role?: boolean;
  third_party_external_role?: boolean;
  date_created?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserRolePermission {
  role_id: string;
  // Inventory & Home Management
  create_inventory_homes?: boolean;
  create_custom_fields?: boolean;
  create_selection_wizard?: boolean;
  // Sales & Contracts
  create_quotes_contracts?: boolean;
  create_change_orders?: boolean;
  approve_change_orders?: boolean;
  edit_home_selections?: boolean;
  unapprove_change_orders?: boolean;
  approve_quotes_contracts?: boolean;
  // Scheduling & Planning
  edit_actual_end_dates?: boolean;
  create_schedules?: boolean;
  create_schedule_templates?: boolean;
  // Estimating & Options
  edit_estimating_item_db?: boolean;
  create_estimating_assemblies?: boolean;
  create_floor_plans?: boolean;
  create_options?: boolean;
  // Administrative
  create_jobs?: boolean;
  create_communities?: boolean;
  create_divisions?: boolean;
  // Pricing
  edit_custom_sales_pricing?: boolean;
  override_option_pricing?: boolean;
  override_floor_plan_pricing?: boolean;
  // Purchasing & Budget
  generate_pos?: boolean;
  approve_pos_for_payment?: boolean;
  create_budgets?: boolean;
  create_pos?: boolean;
  approve_variance_pos?: boolean;
  create_variance_pos?: boolean;
  post_budgets_to_accounting?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserCommunity {
  user_id: string;
  community_id: string;
  builder_id: string;
  is_sales_user?: boolean;
  is_scheduling_user?: boolean;
  is_warranty_user?: boolean;
  date_created?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserRegion {
  user_id: string;
  region_id: string;
  builder_id: string;
  date_created?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface RoomMaster {
  room_master_id: string;
  builder_id: string;
  region_id: string;
  room_location: string;
  floor_level: string | null;
  inactive: boolean;
  inactive_date: Date | null;
  inactive_by: string | null;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  modified_by: string | null;
}

export interface RoomSubcategory {
  room_subcategory_id: string;
  builder_id: string;
  region_id: string;
  room_location: string;
  category_code: string;
  subcategory_code: string;
  unit_of_measure: string;
  inactive: boolean;
  inactive_date: Date | null;
  inactive_by: string | null;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  modified_by: string | null;
}

// Ticketing System Types
export interface TicketCategory {
  category_id: string;
  builder_id: string;
  category_name: string;
  description: string | null;
  color: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TicketPriority {
  priority_id: string;
  builder_id: string;
  priority_name: string;
  priority_level: number;
  color: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TicketStatus {
  status_id: string;
  builder_id: string;
  status_name: string;
  status_type: 'open' | 'in_progress' | 'closed' | 'cancelled';
  color: string;
  is_default_for_type: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Ticket {
  ticket_id: string;
  builder_id: string;
  ticket_number: string;
  title: string;
  description: string | null;
  category_id: string | null;
  priority_id: string | null;
  status_id: string;
  reported_by: string;
  assigned_to: string | null;
  related_job_id: string | null;
  related_home_id: string | null;
  related_community_id: string | null;
  reported_date: Date;
  due_date: Date | null;
  resolved_date: Date | null;
  closed_date: Date | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  resolution_notes: string | null;
  internal_notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TicketComment {
  comment_id: string;
  builder_id: string;
  ticket_id: string;
  user_id: string;
  comment_text: string;
  is_internal: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TicketAttachment {
  attachment_id: string;
  builder_id: string;
  ticket_id: string;
  uploaded_by: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: Date;
}

export interface TicketHistory {
  history_id: string;
  builder_id: string;
  ticket_id: string;
  changed_by: string;
  change_type: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  change_description: string | null;
  created_at: Date;
}

// Create types for ticketing system
export type CreateTicketCategory = Omit<TicketCategory, 'category_id' | 'created_at' | 'updated_at'>;
export type CreateTicketPriority = Omit<TicketPriority, 'priority_id' | 'created_at' | 'updated_at'>;
export type CreateTicketStatus = Omit<TicketStatus, 'status_id' | 'created_at' | 'updated_at'>;
export type CreateTicket = Omit<Ticket, 'ticket_id' | 'ticket_number' | 'created_at' | 'updated_at'>;
export type CreateTicketComment = Omit<TicketComment, 'comment_id' | 'created_at' | 'updated_at'>;
export type CreateTicketAttachment = Omit<TicketAttachment, 'attachment_id' | 'created_at'>;
export type CreateTicketHistory = Omit<TicketHistory, 'history_id' | 'created_at'>;

// Update types for ticketing system
export type UpdateTicketCategory = Partial<Omit<TicketCategory, 'category_id' | 'created_at'>> & { category_id: string };
export type UpdateTicketPriority = Partial<Omit<TicketPriority, 'priority_id' | 'created_at'>> & { priority_id: string };
export type UpdateTicketStatus = Partial<Omit<TicketStatus, 'status_id' | 'created_at'>> & { status_id: string };
export type UpdateTicket = Partial<Omit<Ticket, 'ticket_id' | 'ticket_number' | 'created_at'>> & { ticket_id: string };
export type UpdateTicketComment = Partial<Omit<TicketComment, 'comment_id' | 'created_at'>> & { comment_id: string };

// Ticket filter and query types
export interface TicketFilters {
  status_id?: string;
  category_id?: string;
  priority_id?: string;
  assigned_to?: string;
  reported_by?: string;
  related_job_id?: string;
  related_home_id?: string;
  related_community_id?: string;
  date_from?: Date;
  date_to?: Date;
  search?: string;
}

export interface TicketWithRelations extends Ticket {
  category?: TicketCategory;
  priority?: TicketPriority;
  status: TicketStatus;
  reporter: SafeUser;
  assignee?: SafeUser;
  related_job?: Job;
  related_home?: Home;
  related_community?: Community;
  comments?: TicketComment[];
  attachments?: TicketAttachment[];
}