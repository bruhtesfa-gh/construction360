CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION postgis;

-- CreateTable
CREATE TABLE "accounting_ap_payments" (
    "ap_payment_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "ap_invoice_id" UUID NOT NULL,
    "payment_method" VARCHAR(50),
    "payment_amount" DECIMAL(12,2) NOT NULL,
    "payment_date" TIMESTAMPTZ(6) NOT NULL,
    "check_number" VARCHAR(50),
    "reference_number" VARCHAR(100),
    "notes" TEXT,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounting_ap_payments_pkey" PRIMARY KEY ("ap_payment_id")
);

-- CreateTable
CREATE TABLE "accounting_databases" (
    "accounting_database_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "database_name" VARCHAR(100) NOT NULL,
    "database_type" VARCHAR(50) NOT NULL,
    "connection_string" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounting_databases_pkey" PRIMARY KEY ("accounting_database_id")
);

-- CreateTable
CREATE TABLE "accounting_gl_accounts" (
    "gl_account_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "account_code" VARCHAR(20) NOT NULL,
    "account_name" VARCHAR(100) NOT NULL,
    "account_type" VARCHAR(50) NOT NULL,
    "parent_account_code" VARCHAR(20),
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounting_gl_accounts_pkey" PRIMARY KEY ("gl_account_id")
);

-- CreateTable
CREATE TABLE "accounting_systems" (
    "accounting_system_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "system_name" VARCHAR(100) NOT NULL,
    "system_type" VARCHAR(50) NOT NULL,
    "api_endpoint" VARCHAR(500),
    "api_key_encrypted" TEXT,
    "is_enabled" BOOLEAN DEFAULT true,
    "last_sync_date" TIMESTAMPTZ(6),
    "sync_frequency_hours" INTEGER DEFAULT 24,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounting_systems_pkey" PRIMARY KEY ("accounting_system_id")
);

-- CreateTable
CREATE TABLE "assembly_components" (
    "component_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "parent_assembly_id" UUID NOT NULL,
    "component_assembly_id" UUID NOT NULL,
    "qty" DECIMAL(9,4),
    "sort_order" INTEGER,
    "use_parent_assembly_qty" BOOLEAN DEFAULT false,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assembly_components_pkey" PRIMARY KEY ("component_id")
);

-- CreateTable
CREATE TABLE "assembly_intersect_assemblies" (
    "intersect_assembly_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "intersect_id" INTEGER NOT NULL,
    "assembly_id" UUID NOT NULL,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assembly_intersect_assemblies_pkey" PRIMARY KEY ("intersect_assembly_id")
);

-- CreateTable
CREATE TABLE "assembly_intersect_items" (
    "item_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "intersect_id" INTEGER NOT NULL,
    "assembly_id" UUID NOT NULL,
    "po_index" VARCHAR(40) NOT NULL,
    "takeoff_qty" DECIMAL(14,4) NOT NULL,
    "takeoff_uom" VARCHAR(20),
    "conversion_factor" DECIMAL(9,4),
    "order_qty" DECIMAL(14,4),
    "order_uom" VARCHAR(20),
    "notes" VARCHAR(2000),
    "estimating_db_item_id" UUID NOT NULL,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assembly_intersect_items_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "assembly_intersections" (
    "intersect_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assembly_intersections_pkey" PRIMARY KEY ("intersect_id")
);

-- CreateTable
CREATE TABLE "assembly_items" (
    "assembly_item_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "assembly_id" UUID NOT NULL,
    "sequence_no" INTEGER DEFAULT 1,
    "estimating_db_item_id" UUID,
    "child_item_id" UUID,
    "sub_child_item_id" UUID,
    "required_qty" DECIMAL(19,4) DEFAULT 0,
    "waste_percent" DECIMAL(19,4) DEFAULT 0,
    "community_id" UUID,
    "notes" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_by" UUID,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assembly_items_pkey" PRIMARY KEY ("assembly_item_id")
);

-- CreateTable
CREATE TABLE "assembly_master" (
    "assembly_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "assembly_code" VARCHAR(100) NOT NULL,
    "description" VARCHAR(100),
    "assembly_type" VARCHAR(50),
    "unit_of_measure" VARCHAR(50),
    "total_cost" DECIMAL(19,4) DEFAULT 0,
    "total_qty" DECIMAL(19,4) DEFAULT 0,
    "version_number" INTEGER DEFAULT 1,
    "is_current_version" BOOLEAN DEFAULT true,
    "community_id" UUID,
    "attribute_list_room_id" UUID,
    "attribute_list_category_id" UUID,
    "attribute_list_sub_category_id" UUID,
    "attribute_list_sub_category2_id" UUID,
    "attribute_list_series_id" UUID,
    "attribute_list_brand_id" UUID,
    "attribute_list_manufacturer_id" UUID,
    "attribute_list_color_id" UUID,
    "attribute_list_style_id" UUID,
    "attribute_list_finish_id" UUID,
    "attribute_list_material_id" UUID,
    "attribute_list_room_size_id" UUID,
    "attribute_list_size_id" UUID,
    "attribute_list_location_id" UUID,
    "notes" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_by" UUID,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assembly_master_pkey" PRIMARY KEY ("assembly_id")
);

-- CreateTable
CREATE TABLE "assembly_sales_pricing" (
    "pricing_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "assembly_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "community_phase_id" UUID NOT NULL,
    "assembly_type_id" INTEGER NOT NULL,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "elevation_code" VARCHAR(50) NOT NULL,
    "option_code" VARCHAR(50) NOT NULL,
    "series" VARCHAR(50),
    "category_code" VARCHAR(50),
    "sub_category_code" VARCHAR(50),
    "unit_of_measure" VARCHAR(50),
    "description" VARCHAR(500) NOT NULL,
    "comments" TEXT,
    "cost_basis_type" INTEGER,
    "price" DECIMAL(12,2),
    "construction_cost" DECIMAL(12,2),
    "land_cost" DECIMAL(12,2),
    "commission_cost" DECIMAL(12,2),
    "last_price_change" TIMESTAMP(6),
    "sales_price_sheet" INTEGER,
    "inactive" BOOLEAN DEFAULT false,
    "inactive_date" TIMESTAMP(6),
    "color_attribute_list_id" UUID,
    "style_attribute_list_id" UUID,
    "finish_attribute_list_id" UUID,
    "other_attribute_list_id" UUID,
    "included_at_no_charge" BOOLEAN DEFAULT false,
    "select_by_room" BOOLEAN DEFAULT false,
    "display_total_only" BOOLEAN DEFAULT false,
    "location" VARCHAR(200),
    "main_floor_size" DECIMAL(9,2),
    "lower_level_size" DECIMAL(9,2),
    "second_level_size" DECIMAL(9,2),
    "third_level_size" DECIMAL(9,2),
    "garage_size" DECIMAL(9,2),
    "room_size_adjustment" BOOLEAN DEFAULT false,
    "construction_stage_cutoff" INTEGER,
    "warranty_info" TEXT,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_by" UUID NOT NULL,
    "total_size" DECIMAL(9,2),
    "num_of_beds" DECIMAL(9,2),
    "num_of_baths" DECIMAL(9,2),
    "num_of_garages" DECIMAL(6,2),
    "restriction_warning" BOOLEAN DEFAULT false,
    "restriction_message" TEXT,
    "option_package_id" UUID,
    "no_commission_paid" BOOLEAN DEFAULT false,
    "margin_percentage" DECIMAL(6,2),
    "round_to" DECIMAL(6,2),
    "warranty_details" TEXT,
    "warranty_period_in_months" INTEGER,
    "is_deleted" BOOLEAN DEFAULT false,
    "deleted_date" TIMESTAMP(6),
    "deleted_by" UUID,
    "is_published" BOOLEAN DEFAULT false,
    "published_date" TIMESTAMP(6),
    "published_by" UUID,

    CONSTRAINT "assembly_sales_pricing_pkey" PRIMARY KEY ("pricing_id")
);

-- CreateTable
CREATE TABLE "assembly_types" (
    "assembly_type_id" INTEGER NOT NULL,
    "description" VARCHAR(20),
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assembly_types_pkey" PRIMARY KEY ("assembly_type_id")
);

-- CreateTable
CREATE TABLE "auth_group_permissions" (
    "auth_group_permission_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "auth_group_id" UUID NOT NULL,
    "auth_permission_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_group_permissions_pkey" PRIMARY KEY ("auth_group_permission_id")
);

-- CreateTable
CREATE TABLE "auth_groups" (
    "auth_group_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_groups_pkey" PRIMARY KEY ("auth_group_id")
);

-- CreateTable
CREATE TABLE "auth_permissions" (
    "auth_permission_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "codename" VARCHAR(100) NOT NULL,
    "resource_type" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_permissions_pkey" PRIMARY KEY ("auth_permission_id")
);

-- CreateTable
CREATE TABLE "builders" (
    "builder_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_name" VARCHAR(100),
    "address1" VARCHAR(100),
    "address2" VARCHAR(100),
    "city" VARCHAR(50),
    "state" VARCHAR(20),
    "zip" VARCHAR(10),
    "country" VARCHAR(50),
    "currency" VARCHAR(6),
    "created_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accounting_contact_name" VARCHAR(100),
    "accounting_email" VARCHAR(200),
    "work_phone" VARCHAR(20),
    "mobile_phone" VARCHAR(20),
    "fax" VARCHAR(20),
    "last_billing_date" TIMESTAMP(6),
    "db_server" VARCHAR(50),
    "db_name" VARCHAR(50),
    "local_time_zone_name" VARCHAR(40) NOT NULL DEFAULT 'UTC',
    "geo_location" geography,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "logo_url" TEXT,

    CONSTRAINT "builders_pkey" PRIMARY KEY ("builder_id")
);

-- CreateTable
CREATE TABLE "claim_template_items" (
    "claim_template_item_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "claim_template_id" UUID NOT NULL,
    "item_name" VARCHAR(200) NOT NULL,
    "item_description" TEXT,
    "item_category" VARCHAR(100),
    "default_quantity" DECIMAL(10,4),
    "default_unit_cost" DECIMAL(10,4),
    "default_labor_hours" DECIMAL(6,2),
    "item_order" INTEGER,
    "is_required" BOOLEAN DEFAULT false,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_template_items_pkey" PRIMARY KEY ("claim_template_item_id")
);

-- CreateTable
CREATE TABLE "claim_templates" (
    "claim_template_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "template_name" VARCHAR(200) NOT NULL,
    "template_description" TEXT,
    "claim_type" VARCHAR(100),
    "template_category" VARCHAR(100),
    "default_priority" VARCHAR(20) DEFAULT 'medium',
    "default_warranty_period_months" INTEGER,
    "template_content" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_templates_pkey" PRIMARY KEY ("claim_template_id")
);

-- CreateTable
CREATE TABLE "communities" (
    "community_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "region_id" UUID NOT NULL,
    "builder_id" UUID NOT NULL,
    "community_code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "contract_document_id" UUID,
    "change_order_document_id" UUID,
    "sage_intacct_entity" VARCHAR(50),
    "sage_intacct_location" VARCHAR(50),
    "sage_intacct_department" VARCHAR(50),
    "sage_intacct_bank_account" VARCHAR(50),
    "wip_account" VARCHAR(50),
    "base_home_revenue_acct" VARCHAR(50),
    "lot_revenue_acct" VARCHAR(50),
    "addendum_option_revenue_acct" VARCHAR(50),
    "change_order_revenue_acct" VARCHAR(50),
    "gst_account" VARCHAR(50),
    "gst_rebate_account" VARCHAR(50),
    "accounting_db_id" UUID,
    "sales_manager_id" UUID,
    "estimator_id" UUID,
    "site_superintendent_id" UUID,
    "warranty_rep_id" UUID,
    "warranty_job" VARCHAR(50),
    "material_sales_tax_group" VARCHAR(50),
    "labor_sales_tax_group" VARCHAR(50),
    "subcontract_sales_tax_group" VARCHAR(50),
    "other_sales_tax_group" VARCHAR(50),
    "loan_draw_liability_acct" VARCHAR(50),
    "marketing_comments" TEXT,
    "brochure_file_name" VARCHAR(200),
    "email" VARCHAR(200),
    "logo" VARCHAR(50),
    "address1" VARCHAR(50),
    "address2" VARCHAR(50),
    "city" VARCHAR(50),
    "state" VARCHAR(50),
    "zip" VARCHAR(10),
    "home_phone" VARCHAR(50),
    "mobile_phone" VARCHAR(50),
    "work_phone" VARCHAR(50),
    "fax" VARCHAR(50),
    "last_po_seq" INTEGER,
    "is_inactive" BOOLEAN DEFAULT false,
    "hoa_id" UUID,
    "geo_location" geography,
    "lot_map_image_id" VARCHAR(200),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "division_id" UUID,

    CONSTRAINT "communities_pkey" PRIMARY KEY ("community_id")
);

-- CreateTable
CREATE TABLE "communities_custom_fields" (
    "community_custom_field_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "field_value" TEXT,
    "field_type" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communities_custom_fields_pkey" PRIMARY KEY ("community_custom_field_id")
);

-- CreateTable
CREATE TABLE "community_phase" (
    "community_phase_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "community_phase_code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "sage_intacct_entity" VARCHAR(50),
    "accounting_system" VARCHAR(50),
    "accounting_login" VARCHAR(50),
    "accounting_password" VARCHAR(50),
    "sales_manager_id" UUID,
    "estimator_id" UUID,
    "site_superintendent_id" UUID,
    "warranty_rep_id" UUID,
    "warranty_job" VARCHAR(50),
    "marketing_comments" TEXT,
    "hoa_id" UUID,
    "lot_map_image_id" VARCHAR(200),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_phases_pkey" PRIMARY KEY ("community_phase_id")
);

-- CreateTable
CREATE TABLE "construction_stages" (
    "construction_stage_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "division_id" UUID NOT NULL,
    "construction_stage" INTEGER NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "construction_stages_pkey" PRIMARY KEY ("construction_stage_id")
);

-- CreateTable
CREATE TABLE "contact_types" (
    "contact_type_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "contact_type" VARCHAR(20) NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_types_pkey" PRIMARY KEY ("contact_type_id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "contact_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "contact_type" VARCHAR(20),
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "company_name" VARCHAR(200),
    "email" VARCHAR(200),
    "phone" VARCHAR(50),
    "mobile_phone" VARCHAR(50),
    "address1" VARCHAR(100),
    "address2" VARCHAR(100),
    "city" VARCHAR(50),
    "state" VARCHAR(50),
    "zip" VARCHAR(20),
    "country" VARCHAR(50),
    "notes" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("contact_id")
);

-- CreateTable
CREATE TABLE "contacts_custom_fields" (
    "contact_custom_field_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "field_value" TEXT,
    "field_type" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_custom_fields_pkey" PRIMARY KEY ("contact_custom_field_id")
);

-- CreateTable
CREATE TABLE "cost_code_type" (
    "cost_code_type" INTEGER NOT NULL,
    "cost_code_type_name" VARCHAR(50) NOT NULL,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_code_type_pkey" PRIMARY KEY ("cost_code_type")
);

-- CreateTable
CREATE TABLE "cost_codes" (
    "cost_code_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "accounting_db_id" UUID,
    "cost_code" VARCHAR(20) NOT NULL,
    "description" VARCHAR(50),
    "cost_type" VARCHAR(20),

    CONSTRAINT "cost_codes_pkey" PRIMARY KEY ("cost_code_id")
);

-- CreateTable
CREATE TABLE "customer_shopping_cart" (
    "customer_shopping_cart_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "session_id" VARCHAR(100),
    "item_type" VARCHAR(50) NOT NULL,
    "item_id" UUID NOT NULL,
    "item_name" VARCHAR(200),
    "item_description" TEXT,
    "quantity" INTEGER DEFAULT 1,
    "unit_price" DECIMAL(12,2),
    "total_price" DECIMAL(12,2),
    "discount_amount" DECIMAL(12,2) DEFAULT 0,
    "item_configuration" JSONB,
    "added_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "last_modified" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "is_saved_for_later" BOOLEAN DEFAULT false,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_shopping_cart_pkey" PRIMARY KEY ("customer_shopping_cart_id")
);

-- CreateTable
CREATE TABLE "customers" (
    "customer_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "region_id" UUID NOT NULL,
    "builder_id" UUID NOT NULL,
    "accounting_db_id" UUID,
    "customer_name" VARCHAR(100),
    "address1" VARCHAR(100),
    "address2" VARCHAR(100),
    "city" VARCHAR(50),
    "state" VARCHAR(10),
    "zip" VARCHAR(10),
    "cell_phone" VARCHAR(20),
    "email" VARCHAR(50),
    "home_phone" VARCHAR(20),
    "work_phone" VARCHAR(20),
    "company_name" VARCHAR(100),
    "customer_is_a_company" BOOLEAN,
    "accounting_customer_id" UUID,
    "inactive" BOOLEAN,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("customer_id")
);

-- CreateTable
CREATE TABLE "document_repository" (
    "document_repository_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "document_name" VARCHAR(500) NOT NULL,
    "document_type" VARCHAR(100),
    "file_path" VARCHAR(1000),
    "file_size_bytes" BIGINT,
    "mime_type" VARCHAR(100),
    "document_category" VARCHAR(100),
    "related_entity_type" VARCHAR(50),
    "related_entity_id" UUID,
    "is_template" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "uploaded_by" UUID,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_repository_pkey" PRIMARY KEY ("document_repository_id")
);

-- CreateTable
CREATE TABLE "documents_and_attachments" (
    "document_attachment_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "document_repository_id" UUID,
    "attachment_name" VARCHAR(500) NOT NULL,
    "attachment_description" TEXT,
    "file_path" VARCHAR(1000),
    "file_size_bytes" BIGINT,
    "mime_type" VARCHAR(100),
    "attachment_order" INTEGER,
    "related_entity_type" VARCHAR(50),
    "related_entity_id" UUID,
    "is_public" BOOLEAN DEFAULT false,
    "uploaded_by" UUID,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_and_attachments_pkey" PRIMARY KEY ("document_attachment_id")
);

-- CreateTable
CREATE TABLE "docusign_documents" (
    "docusign_document_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "docusign_envelope_id" UUID NOT NULL,
    "document_id" VARCHAR(100) NOT NULL,
    "document_name" VARCHAR(500),
    "document_order" INTEGER,
    "document_base64" TEXT,
    "document_url" VARCHAR(1000),
    "page_count" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docusign_documents_pkey" PRIMARY KEY ("docusign_document_id")
);

-- CreateTable
CREATE TABLE "docusign_envelope_tabs" (
    "docusign_envelope_tab_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "docusign_envelope_id" UUID NOT NULL,
    "tab_id" VARCHAR(100) NOT NULL,
    "tab_label" VARCHAR(200),
    "tab_type" VARCHAR(50),
    "document_id" VARCHAR(100),
    "page_number" INTEGER,
    "x_position" DECIMAL(10,2),
    "y_position" DECIMAL(10,2),
    "width" DECIMAL(10,2),
    "height" DECIMAL(10,2),
    "recipient_id" VARCHAR(100),
    "tab_value" TEXT,
    "is_required" BOOLEAN DEFAULT false,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docusign_envelope_tabs_pkey" PRIMARY KEY ("docusign_envelope_tab_id")
);

-- CreateTable
CREATE TABLE "docusign_envelopes" (
    "docusign_envelope_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "envelope_id" VARCHAR(100) NOT NULL,
    "envelope_subject" VARCHAR(500),
    "envelope_message" TEXT,
    "status" VARCHAR(50),
    "sent_date" TIMESTAMPTZ(6),
    "completed_date" TIMESTAMPTZ(6),
    "voided_date" TIMESTAMPTZ(6),
    "voided_reason" VARCHAR(500),
    "related_entity_type" VARCHAR(50),
    "related_entity_id" UUID,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docusign_envelopes_pkey" PRIMARY KEY ("docusign_envelope_id")
);

-- CreateTable
CREATE TABLE "docusign_oauth2" (
    "docusign_oauth2_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "client_id" VARCHAR(200),
    "client_secret_encrypted" TEXT,
    "access_token_encrypted" TEXT,
    "refresh_token_encrypted" TEXT,
    "token_expires_at" TIMESTAMPTZ(6),
    "account_id" VARCHAR(100),
    "base_uri" VARCHAR(500),
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docusign_oauth2_pkey" PRIMARY KEY ("docusign_oauth2_id")
);

-- CreateTable
CREATE TABLE "docusign_recipient_event_log" (
    "docusign_recipient_event_log_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "docusign_envelope_id" UUID NOT NULL,
    "recipient_id" VARCHAR(100) NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "event_date" TIMESTAMPTZ(6) NOT NULL,
    "event_description" TEXT,
    "ip_address" INET,
    "user_agent" TEXT,
    "geo_location" VARCHAR(200),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docusign_recipient_event_log_pkey" PRIMARY KEY ("docusign_recipient_event_log_id")
);

-- CreateTable
CREATE TABLE "docusign_recipient_status" (
    "docusign_recipient_status_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "docusign_envelope_id" UUID NOT NULL,
    "recipient_id" VARCHAR(100) NOT NULL,
    "recipient_name" VARCHAR(200),
    "recipient_email" VARCHAR(200),
    "recipient_type" VARCHAR(50),
    "status" VARCHAR(50),
    "signing_order" INTEGER,
    "sent_date" TIMESTAMPTZ(6),
    "delivered_date" TIMESTAMPTZ(6),
    "signed_date" TIMESTAMPTZ(6),
    "declined_date" TIMESTAMPTZ(6),
    "declined_reason" VARCHAR(500),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docusign_recipient_status_pkey" PRIMARY KEY ("docusign_recipient_status_id")
);

-- CreateTable
CREATE TABLE "docusign_role_tabs" (
    "docusign_role_tab_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "digital_signature_role_id" UUID NOT NULL,
    "tab_label" VARCHAR(200) NOT NULL,
    "tab_type" VARCHAR(50) NOT NULL,
    "is_required" BOOLEAN DEFAULT false,
    "default_value" VARCHAR(500),
    "validation_pattern" VARCHAR(200),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "docusign_role_tabs_pkey" PRIMARY KEY ("docusign_role_tab_id")
);

-- CreateTable
CREATE TABLE "elevation_images" (
    "elevation_image_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "elevation_code" VARCHAR(50) NOT NULL,
    "community_id" UUID NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "sort_order" INTEGER,
    "image_path" VARCHAR(200),
    "image_file" VARCHAR(200),
    "storage_system_identifier" VARCHAR(200) NOT NULL,
    "inactive" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "elevation_images_pkey" PRIMARY KEY ("elevation_image_id")
);

-- CreateTable
CREATE TABLE "elevation_room_sizes" (
    "elevation_room_size_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "elevation_code" VARCHAR(50) NOT NULL,
    "room_location" VARCHAR(200) NOT NULL,
    "category_code" VARCHAR(50) NOT NULL,
    "sub_category_code" VARCHAR(50) NOT NULL,
    "unit_of_measure" VARCHAR(50) NOT NULL,
    "quantity" DECIMAL(10,4),
    "inactive" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "elevation_room_sizes_pkey" PRIMARY KEY ("elevation_room_size_id")
);

-- CreateTable
CREATE TABLE "elevations" (
    "elevation_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "community_phase_id" UUID NOT NULL,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "series" VARCHAR(50) NOT NULL,
    "elevation_code" VARCHAR(50) NOT NULL,
    "assembly_id" UUID,
    "floor_plan_assembly_id" UUID NOT NULL,
    "description" VARCHAR(200),
    "comments" TEXT,
    "num_of_beds" DECIMAL(9,2),
    "num_of_baths" DECIMAL(9,2),
    "num_of_garages" DECIMAL(9,2),
    "main_floor_size" DECIMAL(9,2),
    "lower_level_size" DECIMAL(9,2),
    "second_level_size" DECIMAL(9,2),
    "third_level_size" DECIMAL(6,2),
    "garage_size" DECIMAL(9,2),
    "total_size" DECIMAL(9,2),
    "selling_price" DECIMAL(12,2),
    "cost" DECIMAL(12,2),
    "inactive" BOOLEAN DEFAULT false,
    "inactive_date" TIMESTAMPTZ(6),
    "is_deleted" BOOLEAN DEFAULT false,
    "deleted_date" TIMESTAMPTZ(6),
    "deleted_by" UUID,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "elevations_pkey" PRIMARY KEY ("elevation_id")
);

-- CreateTable
CREATE TABLE "estimating_db_child_item_lists" (
    "child_item_list_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "item_list_name" VARCHAR(100),
    "allow_custom_items" BOOLEAN DEFAULT false,
    "not_required" BOOLEAN DEFAULT false,
    "strict_list" BOOLEAN DEFAULT false,
    "inactive" BOOLEAN DEFAULT false,
    "default_child_item_id" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estimating_db_child_item_lists_pkey" PRIMARY KEY ("child_item_list_id")
);

-- CreateTable
CREATE TABLE "estimating_db_child_list_items" (
    "child_list_item_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "child_item_list_id" UUID NOT NULL,
    "child_item_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "description" VARCHAR(200),
    "manufacturer_part_number" VARCHAR(50),
    "comments" TEXT,
    "inactive" BOOLEAN DEFAULT false,
    "sub_child_item_list_id" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estimating_db_child_list_items_pkey" PRIMARY KEY ("child_list_item_id")
);

-- CreateTable
CREATE TABLE "estimating_db_groups" (
    "estimating_db_group_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "estimating_db_group" VARCHAR(20) NOT NULL,
    "description" VARCHAR(200),
    "is_deleted" BOOLEAN DEFAULT false,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_by" UUID,
    "is_parent_group" BOOLEAN NOT NULL DEFAULT false,
    "parent_code" VARCHAR(20),
    "parent_description" VARCHAR(200),
    "deleted_date" TIMESTAMP(6),
    "deleted_by" UUID,

    CONSTRAINT "estimating_db_groups_pkey" PRIMARY KEY ("estimating_db_group_id")
);

-- CreateTable
CREATE TABLE "estimating_db_items" (
    "estimating_db_item_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "estimating_db_group" VARCHAR(100) NOT NULL,
    "estimating_db_item_code" VARCHAR(100) NOT NULL,
    "item_description" VARCHAR(100),
    "unit_of_measure" VARCHAR(50),
    "conversion_factor" DECIMAL(19,4) DEFAULT 1,
    "child_item_list_id" UUID,
    "inverse_item_id" UUID,
    "created_by" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_by" UUID,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "item_id" UUID,
    "price_link" INTEGER,
    "internal_notes" TEXT,
    "po_index" VARCHAR(40),
    "jc_cost_code" VARCHAR(40),
    "jc_cost_type" VARCHAR(40),
    "order_uom" VARCHAR(20),
    "takeoff_uom" VARCHAR(20),
    "cost_amount" DECIMAL(9,2),
    "tax_group" VARCHAR(50),
    "waste_percent" DECIMAL(9,2),
    "round_dir" INTEGER,
    "round_to" DECIMAL(10,4),
    "estimating_db_group_sort_order" DECIMAL(9,2),
    "estimating_db_item_sort_order" DECIMAL(9,2),
    "manufacturer_part_number" VARCHAR(50),
    "cost_type" VARCHAR(1),
    "estimating_db_item_number" VARCHAR(20),
    "lump_sum_bid" BOOLEAN DEFAULT false,
    "use_in_scheduling_vpo" BOOLEAN DEFAULT false,
    "alt_jc_cost_code" VARCHAR(40),
    "alt_jc_cost_type" VARCHAR(40),
    "location" VARCHAR(500),
    "option_code" VARCHAR(50),
    "color" VARCHAR(500),
    "option_sub_category" VARCHAR(50),
    "retail_pretax" DECIMAL(14,2),
    "inverse_estimating_db_group" VARCHAR(20),
    "inverse_estimating_db_item" VARCHAR(20),
    "is_deleted" BOOLEAN DEFAULT false,
    "comments" TEXT,
    "child_item_list_id_alt" UUID,
    "inactive" BOOLEAN DEFAULT false,
    "schedule_master_task_id" UUID,
    "deleted_date" TIMESTAMP(6),
    "deleted_by" UUID,
    "option_category_code" VARCHAR(50),
    "inverse_item_id_alt" UUID,

    CONSTRAINT "estimating_db_items_pkey" PRIMARY KEY ("estimating_db_item_id")
);

-- CreateTable
CREATE TABLE "estimating_db_items_po_index" (
    "items_po_index_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "po_index" VARCHAR(40) NOT NULL,
    "default_percent" DECIMAL(7,4),
    "estimating_db_item_id" UUID NOT NULL,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estimating_db_items_po_index_pkey" PRIMARY KEY ("items_po_index_id")
);

-- CreateTable
CREATE TABLE "field_label_templates" (
    "template_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "template_name" VARCHAR(100) NOT NULL,
    "template_description" TEXT,
    "industry_type" VARCHAR(50),
    "template_data" JSONB NOT NULL,
    "is_system_template" BOOLEAN DEFAULT false,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "field_label_templates_pkey" PRIMARY KEY ("template_id")
);

-- CreateTable
CREATE TABLE "field_labels" (
    "field_label_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "table_name" VARCHAR(100) NOT NULL,
    "column_name" VARCHAR(100) NOT NULL,
    "custom_label" VARCHAR(200) NOT NULL,
    "placeholder_text" VARCHAR(200),
    "help_text" TEXT,
    "is_visible" BOOLEAN DEFAULT true,
    "is_required" BOOLEAN,
    "validation_rules" JSONB,
    "display_order" INTEGER,
    "field_group" VARCHAR(100),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "field_labels_pkey" PRIMARY KEY ("field_label_id")
);

-- CreateTable
CREATE TABLE "floor_plan_community" (
    "floor_plan_community_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "builder_id" UUID NOT NULL,
    "community_phase_id" UUID,
    "version_number" INTEGER,
    "series" VARCHAR(50),
    "floor_plan_assembly_id" UUID,
    "description" VARCHAR(200),
    "comments" TEXT,
    "floor_plan_orientation" VARCHAR(50),
    "num_of_beds" DECIMAL(9,2),
    "num_of_baths" DECIMAL(9,2),
    "num_of_garages" DECIMAL(9,2),
    "main_floor_size" DECIMAL(9,2),
    "lower_level_size" DECIMAL(9,2),
    "second_level_size" DECIMAL(9,2),
    "third_level_size" DECIMAL(9,2),
    "garage_size" DECIMAL(9,2),
    "total_size" DECIMAL(9,2),
    "inactive" BOOLEAN NOT NULL DEFAULT false,
    "inactive_date" TIMESTAMP(6),
    "brochure" VARCHAR(200),
    "selling_price" DECIMAL(12,2),
    "cost" DECIMAL(12,2),
    "margin" DECIMAL(7,2),
    "markup" DECIMAL(7,2),
    "sales_price_sheet" INTEGER,
    "style" VARCHAR(200),
    "is_deleted" BOOLEAN DEFAULT false,
    "last_price_change" TIMESTAMP(6),
    "front_length" DECIMAL(9,2),
    "back_length" DECIMAL(9,2),
    "left_side_length" DECIMAL(9,2),
    "right_side_length" DECIMAL(9,2),
    "internal_notes" TEXT,
    "schedule_template_id" UUID,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "elevation_code" VARCHAR(50),
    "elevation_id" UUID,
    "deleted_date" TIMESTAMP(6),
    "deleted_by" UUID,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "floor_plan_master_id" UUID,

    CONSTRAINT "floor_plan_community_pkey" PRIMARY KEY ("floor_plan_community_id")
);

-- CreateTable
CREATE TABLE "floor_plan_images" (
    "floor_plan_image_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID,
    "description" VARCHAR(200) NOT NULL,
    "sort_order" INTEGER,
    "image_path" VARCHAR(200),
    "image_file" VARCHAR(200),
    "storage_system_identifier" VARCHAR(200) NOT NULL,
    "inactive" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "floor_plan_images_pkey" PRIMARY KEY ("floor_plan_image_id")
);

-- CreateTable
CREATE TABLE "floor_plan_master" (
    "floor_plan_master_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "floor_plan_name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "square_footage" INTEGER,
    "bedrooms" INTEGER,
    "bathrooms" DECIMAL(3,1),
    "garage_spaces" INTEGER,
    "floors" INTEGER DEFAULT 1,
    "architectural_style" VARCHAR(100),
    "base_price" DECIMAL(12,2),
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "modified_by" UUID,
    "created_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "floor_plan_master_pkey" PRIMARY KEY ("floor_plan_master_id")
);

-- CreateTable
CREATE TABLE "floor_plan_pricing_history" (
    "floor_plan_pricing_history_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "floor_plan_id" UUID NOT NULL,
    "date_changed" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "old_price" DECIMAL(9,2),
    "new_price" DECIMAL(9,2),
    "changed_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "floor_plan_pricing_history_pkey" PRIMARY KEY ("floor_plan_pricing_history_id")
);

-- CreateTable
CREATE TABLE "floor_plan_room_sizes" (
    "floor_plan_room_size_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "room_location" VARCHAR(200) NOT NULL,
    "category_code" VARCHAR(50) NOT NULL,
    "sub_category_code" VARCHAR(50) NOT NULL,
    "unit_of_measure" VARCHAR(50) NOT NULL,
    "quantity" DECIMAL(12,4),
    "inactive" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "floor_plan_room_sizes_pkey" PRIMARY KEY ("floor_plan_room_size_id")
);

-- CreateTable
CREATE TABLE "home_inspection_deficiencies" (
    "home_inspection_deficiency_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "home_inspection_id" UUID NOT NULL,
    "home_inspection_item_id" UUID,
    "deficiency_code" VARCHAR(50),
    "deficiency_title" VARCHAR(200) NOT NULL,
    "deficiency_description" TEXT NOT NULL,
    "location_description" VARCHAR(200),
    "severity" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "status" VARCHAR(50) NOT NULL DEFAULT 'open',
    "assigned_to" UUID,
    "due_date" TIMESTAMPTZ(6),
    "resolved_date" TIMESTAMPTZ(6),
    "resolution_notes" TEXT,
    "estimated_cost" DECIMAL(10,2),
    "actual_cost" DECIMAL(10,2),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_inspection_deficiencies_pkey" PRIMARY KEY ("home_inspection_deficiency_id")
);

-- CreateTable
CREATE TABLE "home_inspection_deficiencies_images" (
    "home_inspection_deficiency_image_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "home_inspection_deficiency_id" UUID NOT NULL,
    "image_name" VARCHAR(500) NOT NULL,
    "image_description" VARCHAR(500),
    "file_path" VARCHAR(1000),
    "file_size_bytes" BIGINT,
    "mime_type" VARCHAR(100),
    "image_order" INTEGER,
    "is_before_photo" BOOLEAN DEFAULT true,
    "is_after_photo" BOOLEAN DEFAULT false,
    "taken_date" TIMESTAMPTZ(6),
    "uploaded_by" UUID,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_inspection_deficiencies_images_pkey" PRIMARY KEY ("home_inspection_deficiency_image_id")
);

-- CreateTable
CREATE TABLE "home_inspection_items" (
    "home_inspection_item_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "home_inspection_id" UUID NOT NULL,
    "inspection_checklist_item_id" UUID,
    "item_category" VARCHAR(100),
    "item_name" VARCHAR(200) NOT NULL,
    "item_description" TEXT,
    "location_description" VARCHAR(200),
    "grade" VARCHAR(10),
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "priority" VARCHAR(20) DEFAULT 'medium',
    "notes" TEXT,
    "item_order" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_inspection_items_pkey" PRIMARY KEY ("home_inspection_item_id")
);

-- CreateTable
CREATE TABLE "home_inspections" (
    "home_inspection_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "job_id" UUID,
    "home_id" UUID,
    "inspection_type" VARCHAR(100) NOT NULL,
    "inspection_date" TIMESTAMPTZ(6) NOT NULL,
    "inspector_name" VARCHAR(200),
    "inspector_company" VARCHAR(200),
    "inspector_phone" VARCHAR(20),
    "inspector_email" VARCHAR(200),
    "inspection_status" VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    "overall_grade" VARCHAR(10),
    "notes" TEXT,
    "weather_conditions" VARCHAR(100),
    "temperature_fahrenheit" INTEGER,
    "inspection_duration_minutes" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_inspections_pkey" PRIMARY KEY ("home_inspection_id")
);

-- CreateTable
CREATE TABLE "home_selection_sheet_response" (
    "home_selection_sheet_response_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "home_id" UUID,
    "job_id" UUID,
    "quote_contract_id" UUID,
    "selection_sheet_question_id" UUID NOT NULL,
    "response_value" TEXT,
    "response_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "customer_name" VARCHAR(200),
    "customer_signature" VARCHAR(500),
    "signature_date" TIMESTAMPTZ(6),
    "is_approved" BOOLEAN DEFAULT false,
    "approved_by" UUID,
    "approved_date" TIMESTAMPTZ(6),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_selection_sheet_response_pkey" PRIMARY KEY ("home_selection_sheet_response_id")
);

-- CreateTable
CREATE TABLE "home_selections" (
    "home_selection_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "for_estimating_purpose_only" BOOLEAN DEFAULT false,
    "inventory_home_id" UUID,
    "quote_contract_id" UUID,
    "option_id" UUID,
    "assembly_id" UUID,
    "jc_extra" VARCHAR(50),
    "is_custom" BOOLEAN DEFAULT false,
    "is_require_quote" BOOLEAN DEFAULT false,
    "is_declined_by_builder" BOOLEAN DEFAULT false,
    "declined_reason" VARCHAR(200),
    "is_estimated" BOOLEAN DEFAULT false,
    "estimated_date" TIMESTAMPTZ(6),
    "description" VARCHAR(500),
    "comments" TEXT,
    "internal_notes" TEXT,
    "option_category_code" VARCHAR(50),
    "option_subcategory_code" VARCHAR(50),
    "quantity" DECIMAL(12,4),
    "unit_of_measure" VARCHAR(20),
    "price" DECIMAL(12,4),
    "total" DECIMAL(12,2),
    "sales_tax" DECIMAL(10,2),
    "tax_incl_total" DECIMAL(12,2),
    "is_deleted" BOOLEAN DEFAULT false,
    "deleted_by" UUID,
    "deleted_date" TIMESTAMPTZ(6),
    "location" VARCHAR(500),
    "room_location" VARCHAR(200),
    "displayed_quantity" DECIMAL(12,4),
    "displayed_total" DECIMAL(12,2),
    "color_attribute_list_id" UUID,
    "color" VARCHAR(500),
    "style_attribute_list_id" UUID,
    "style" VARCHAR(500),
    "finish_attribute_list_id" UUID,
    "finish" VARCHAR(500),
    "other_attribute_list_id" UUID,
    "other" VARCHAR(500),
    "is_from_inventory_home" BOOLEAN DEFAULT false,
    "selection_response_id" UUID,
    "product_number" VARCHAR(100),
    "product_name" VARCHAR(100),
    "product_brand" VARCHAR(100),
    "product_manufacturer" VARCHAR(100),
    "product_style_key" VARCHAR(100),
    "product_style_name" VARCHAR(100),
    "external_option_number" VARCHAR(50),
    "is_included_option" BOOLEAN DEFAULT false,
    "inventory_home_co_master_id" UUID,
    "quote_contract_co_master_id" UUID,
    "main_floor_size" DECIMAL(9,2),
    "lower_level_size" DECIMAL(9,2),
    "second_level_size" DECIMAL(9,2),
    "third_level_size" DECIMAL(9,2),
    "garage_size" DECIMAL(9,2),
    "total_size" DECIMAL(9,2),
    "num_of_beds" DECIMAL(7,2),
    "num_of_baths" DECIMAL(7,2),
    "num_of_garages" DECIMAL(7,2),
    "select_by_room" BOOLEAN DEFAULT false,
    "display_total_only" BOOLEAN DEFAULT false,
    "room_size_adjustment" DECIMAL(9,2),
    "financed" BOOLEAN DEFAULT true,
    "financed_amount" DECIMAL(12,2),
    "pay_by_cash" BOOLEAN DEFAULT false,
    "pay_by_cash_amount" DECIMAL(12,2),
    "color_attribute_required" BOOLEAN DEFAULT false,
    "style_attribute_required" BOOLEAN DEFAULT false,
    "finish_attribute_required" BOOLEAN DEFAULT false,
    "other_attribute_required" BOOLEAN DEFAULT false,
    "added_by_option_rule" BOOLEAN DEFAULT false,
    "option_rule_option_id" UUID,
    "color_other_attribute_list_id" UUID,
    "style_other_attribute_list_id" UUID,
    "finish_other_attribute_list_id" UUID,
    "other_other_attribute_list_id" UUID,
    "deposit_expected" DECIMAL(12,2),
    "deposit_received" DECIMAL(12,2),
    "date_deposit_received" TIMESTAMPTZ(6),
    "deposit_posted_to_accounting" BOOLEAN DEFAULT false,
    "date_deposit_posted_to_accounting" TIMESTAMPTZ(6),
    "deposit_posted_by" UUID,
    "inventory_homes_selection_id" UUID,
    "locked_by_estimating" BOOLEAN DEFAULT false,
    "locked_by_estimating_date" TIMESTAMPTZ(6),
    "locked_by_estimating_user_id" UUID,
    "option_package_id" UUID,
    "color_other" VARCHAR(500),
    "style_other" VARCHAR(500),
    "finish_other" VARCHAR(500),
    "other_other" VARCHAR(500),
    "home_id" UUID,
    "cancellation_of_home_selection_id" UUID,
    "replacement_of_home_selection_id" UUID,
    "ui_caption_notes" VARCHAR(200),
    "home_owner_warranty_details" TEXT,
    "warranty_period_in_months" INTEGER,
    "serial_number" VARCHAR(50),
    "warranty_start_date" DATE,
    "install_date" DATE,
    "added_from_online_shopping" BOOLEAN DEFAULT false,
    "selection_sub_response1_id" UUID,
    "selection_sub_response2_id" UUID,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_selections_pkey" PRIMARY KEY ("home_selection_id")
);

-- CreateTable
CREATE TABLE "homes" (
    "home_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "builder_id" UUID NOT NULL,
    "community_phase_code" VARCHAR(50),
    "lot_inventory_id" UUID,
    "floor_plan_id" UUID,
    "elevation_id" UUID,
    "floor_plan_code" VARCHAR(50),
    "series" VARCHAR(50),
    "elevation_code" VARCHAR(50),
    "floor_plan_price" DECIMAL(12,2),
    "elevation_price" DECIMAL(12,2),
    "sales_discount" DECIMAL(12,2),
    "sales_incentive" DECIMAL(12,2),
    "lot_price" DECIMAL(12,2),
    "garage_orientation" VARCHAR(50),
    "exterior_color" VARCHAR(100),
    "sales_incentives" DECIMAL(12,2),
    "is_estimated" BOOLEAN,
    "estimate_created_date" TIMESTAMP(6),
    "job_number" VARCHAR(50),
    "unit_number" VARCHAR(50),
    "schedule_template_id" UUID,
    "construction_start_date" TIMESTAMP(6),
    "stage_of_construction" INTEGER,
    "lot_info_tooltip" TEXT,
    "main_floor_size" DECIMAL(9,2),
    "lower_level_size" DECIMAL(9,2),
    "second_level_size" DECIMAL(9,2),
    "third_level_size" DECIMAL(9,2),
    "garage_size" DECIMAL(9,2),
    "total_size" DECIMAL(9,2),
    "internal_sales_commission" DECIMAL(9,2),
    "realtor_sales_commission" DECIMAL(9,2),
    "permit_applied_for_date" TIMESTAMP(6),
    "permit_received_date" TIMESTAMP(6),
    "permit_released_date" TIMESTAMP(6),
    "permit_number" VARCHAR(50),
    "scheduled_start_date" TIMESTAMP(6),
    "construction_stage" INTEGER,
    "not_available_for_sale" BOOLEAN,
    "release_to_estimating" BOOLEAN,
    "release_to_estimating_by" UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    "release_to_estimating_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "project_manager_id" UUID,
    "estimator_id" UUID,
    "design_center_sales_person_id" UUID,
    "addl_premium" DECIMAL(12,2),
    "sales_person_id" UUID,
    "pre_construction_stage" INTEGER,
    "sequence" BIGSERIAL NOT NULL,
    "floor_plan_assembly_id" UUID,
    "elevation_assembly_id" UUID,
    "home_type" VARCHAR(50),
    "pre_contract_selection_sheet" UUID,
    "post_contract_selection_sheet" UUID,
    "description" VARCHAR(200),
    "marketing_info" TEXT,
    "cancelled_date" TIMESTAMP(6),
    "cancelled_by" UUID,
    "loan_draws_received" DECIMAL(12,2),
    "deposits_received" DECIMAL(12,2),
    "total_closing_adjustments" DECIMAL(12,2),
    "hoa_id" UUID,
    "sales_commission_rate_on_base" DECIMAL(6,2),
    "sales_commission_rate_on_lot" DECIMAL(6,2),
    "sales_commission_rate_on_options" DECIMAL(6,2),
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homes_pkey" PRIMARY KEY ("home_id")
);

-- CreateTable
CREATE TABLE "inspection_checklist_items" (
    "inspection_checklist_item_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "inspection_checklist_id" UUID NOT NULL,
    "item_category" VARCHAR(100),
    "item_name" VARCHAR(200) NOT NULL,
    "item_description" TEXT,
    "item_code" VARCHAR(50),
    "expected_result" VARCHAR(500),
    "item_order" INTEGER,
    "is_required" BOOLEAN DEFAULT true,
    "is_critical" BOOLEAN DEFAULT false,
    "minimum_grade" VARCHAR(10),
    "points_possible" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_checklist_items_pkey" PRIMARY KEY ("inspection_checklist_item_id")
);

-- CreateTable
CREATE TABLE "inspection_checklists" (
    "inspection_checklist_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID,
    "checklist_name" VARCHAR(200) NOT NULL,
    "checklist_description" TEXT,
    "inspection_type" VARCHAR(100) NOT NULL,
    "construction_stage" VARCHAR(100),
    "is_template" BOOLEAN DEFAULT true,
    "is_active" BOOLEAN DEFAULT true,
    "version_number" VARCHAR(20),
    "effective_date" TIMESTAMPTZ(6),
    "expiration_date" TIMESTAMPTZ(6),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_checklists_pkey" PRIMARY KEY ("inspection_checklist_id")
);

-- CreateTable
CREATE TABLE "inspection_deficiency_pick_lists" (
    "inspection_deficiency_pick_list_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "deficiency_category" VARCHAR(100) NOT NULL,
    "deficiency_code" VARCHAR(50) NOT NULL,
    "deficiency_title" VARCHAR(200) NOT NULL,
    "deficiency_description" TEXT,
    "default_severity" VARCHAR(20) DEFAULT 'medium',
    "estimated_resolution_hours" DECIMAL(5,2),
    "estimated_cost" DECIMAL(10,2),
    "common_causes" TEXT,
    "resolution_instructions" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_deficiency_pick_lists_pkey" PRIMARY KEY ("inspection_deficiency_pick_list_id")
);

-- CreateTable
CREATE TABLE "inspection_quality_grades" (
    "inspection_quality_grade_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "grade_code" VARCHAR(10) NOT NULL,
    "grade_name" VARCHAR(50) NOT NULL,
    "grade_description" VARCHAR(200),
    "numeric_value" DECIMAL(5,2),
    "pass_fail_indicator" BOOLEAN,
    "color_code" VARCHAR(10),
    "display_order" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_quality_grades_pkey" PRIMARY KEY ("inspection_quality_grade_id")
);

-- CreateTable
CREATE TABLE "inventory_home_co_master" (
    "inventory_home_co_master_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "inventory_home_id" UUID NOT NULL,
    "change_order_number" INTEGER NOT NULL,
    "is_deleted" BOOLEAN DEFAULT false,
    "prefix_value" VARCHAR(20),
    "co_date" TIMESTAMPTZ(6),
    "customer_approved" BOOLEAN DEFAULT false,
    "customer_approved_date" TIMESTAMPTZ(6),
    "final_approval_date" TIMESTAMPTZ(6),
    "final_approved" BOOLEAN DEFAULT false,
    "final_approval_by" UUID,
    "final_approval_rescinded_by" UUID,
    "final_approval_rescinded_date" TIMESTAMPTZ(6),
    "estimating_approved" BOOLEAN DEFAULT false,
    "estimating_approved_date" TIMESTAMPTZ(6),
    "comments" TEXT,
    "co_fee" DECIMAL(7,2),
    "co_pre_tax" DECIMAL(12,2),
    "co_tax" DECIMAL(12,2),
    "co_grand_total" DECIMAL(12,2),
    "deposit_paid" DECIMAL(12,2),
    "deposit_paid_date" TIMESTAMPTZ(6),
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_home_co_master_pkey" PRIMARY KEY ("inventory_home_co_master_id")
);

-- CreateTable
CREATE TABLE "inventory_home_types" (
    "inventory_home_type_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "inventory_home_type" VARCHAR(50) NOT NULL,
    "customized_description" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_home_types_pkey" PRIMARY KEY ("inventory_home_type_id")
);

-- CreateTable
CREATE TABLE "inventory_homes" (
    "inventory_home_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "community_phase_code" VARCHAR(50),
    "lot_inventory_id" UUID,
    "floor_plan_id" UUID,
    "elevation_id" UUID,
    "floor_plan_code" VARCHAR(50),
    "series" VARCHAR(50),
    "elevation_code" VARCHAR(50),
    "floor_plan_price" DECIMAL(12,2),
    "elevation_price" DECIMAL(12,2),
    "lot_price" DECIMAL(12,2),
    "garage_orientation" VARCHAR(50),
    "exterior_color" VARCHAR(100),
    "sales_incentives" DECIMAL(12,2),
    "is_estimated" BOOLEAN DEFAULT false,
    "estimated_date" TIMESTAMPTZ(6),
    "job_number" VARCHAR(50),
    "unit_number" VARCHAR(50),
    "schedule_template_id" UUID,
    "construction_start_date" TIMESTAMPTZ(6),
    "stage_of_construction" INTEGER,
    "lot_info_tooltip" TEXT,
    "main_floor_size" DECIMAL(9,2),
    "lower_level_size" DECIMAL(9,2),
    "second_level_size" DECIMAL(9,2),
    "third_level_size" DECIMAL(9,2),
    "garage_size" DECIMAL(9,2),
    "total_size" DECIMAL(9,2),
    "permit_applied_for_date" TIMESTAMPTZ(6),
    "permit_received_date" TIMESTAMPTZ(6),
    "permit_released_date" TIMESTAMPTZ(6),
    "permit_number" VARCHAR(50),
    "scheduled_start_date" TIMESTAMPTZ(6),
    "construction_stage" INTEGER,
    "not_available_for_sale" BOOLEAN DEFAULT false,
    "release_to_estimating" BOOLEAN DEFAULT false,
    "project_manager_id" UUID,
    "estimator_id" UUID,
    "design_center_sales_person_id" UUID,
    "sales_person_id" UUID,
    "addl_premium" DECIMAL(12,2),
    "pre_construction_stage" INTEGER,
    "floor_plan_assembly_id" UUID,
    "elevation_assembly_id" UUID,
    "inventory_home_type" VARCHAR(50),
    "pre_contract_selection_sheet" UUID,
    "post_contract_selection_sheet" UUID,
    "description" VARCHAR(200),
    "marketing_info" TEXT,
    "home_id" UUID,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_homes_pkey" PRIMARY KEY ("inventory_home_id")
);

-- CreateTable
CREATE TABLE "inventory_homes_custom_fields" (
    "inventory_home_custom_field_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "inventory_home_id" UUID NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "field_value" TEXT,
    "field_type" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_homes_custom_fields_pkey" PRIMARY KEY ("inventory_home_custom_field_id")
);

-- CreateTable
CREATE TABLE "inventory_homes_room_sizes" (
    "inventory_home_room_size_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "inventory_home_id" UUID NOT NULL,
    "room" VARCHAR(200) NOT NULL,
    "sub_category" VARCHAR(50) NOT NULL,
    "unit_of_measure" VARCHAR(50) NOT NULL,
    "quantity" DECIMAL(10,4),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_homes_room_sizes_pkey" PRIMARY KEY ("inventory_home_room_size_id")
);

-- CreateTable
CREATE TABLE "ap_invoice_items" (
    "ap_invoice_item_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "ap_invoice_id" UUID NOT NULL,
    "line_number" INTEGER NOT NULL,
    "po_number" VARCHAR(50),
    "quantity" DECIMAL(12,4),
    "unit_cost" DECIMAL(12,4),
    "total_cost" DECIMAL(14,2),
    "description" VARCHAR(500),
    "gl_account_code" VARCHAR(20),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ap_invoice_items_pkey" PRIMARY KEY ("ap_invoice_item_id")
);

-- CreateTable
CREATE TABLE "ap_invoices" (
    "ap_invoice_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "invoice_number" VARCHAR(40) NOT NULL,
    "job_number" VARCHAR(50),
    "status" VARCHAR(15),
    "pretax_amount" DECIMAL(14,2),
    "tax_amount" DECIMAL(12,2),
    "misc_deduction_amount" DECIMAL(12,2),
    "discount_amount" DECIMAL(12,2),
    "discount_date" TIMESTAMPTZ(6),
    "received_date" TIMESTAMPTZ(6),
    "invoice_date" TIMESTAMPTZ(6) NOT NULL,
    "payment_due_date" TIMESTAMPTZ(6),
    "accounting_date" TIMESTAMPTZ(6),
    "description" VARCHAR(500),
    "errors" VARCHAR(2000),
    "source" VARCHAR(20),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ap_invoices_pkey" PRIMARY KEY ("ap_invoice_id")
);

-- CreateTable
CREATE TABLE "job_estimate_items" (
    "est_item_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "home_selection_id" UUID,
    "inventory_home_id" UUID,
    "quote_contract_id" UUID,
    "is_deleted" BOOLEAN DEFAULT false,
    "po_index" VARCHAR(40),
    "estimating_db_group" VARCHAR(20),
    "estimating_db_item" VARCHAR(20),
    "job_number" VARCHAR(50),
    "unit_number" VARCHAR(50),
    "jc_extra" VARCHAR(50) DEFAULT '',
    "jc_cost_code" VARCHAR(50),
    "jc_cost_type" VARCHAR(50),
    "sort_order" INTEGER,
    "description" VARCHAR(200),
    "comments" TEXT,
    "takeoff_qty" DECIMAL(14,4) DEFAULT 0,
    "takeoff_uom" VARCHAR(20),
    "conversion_factor" DECIMAL(10,4),
    "order_uom" VARCHAR(20),
    "budget_supplier_id" UUID,
    "budget_qty" DECIMAL(14,4) DEFAULT 0,
    "budget_rate" DECIMAL(14,4) DEFAULT 0,
    "budget_pretax" DECIMAL(14,2) DEFAULT 0,
    "budget_tax_group" VARCHAR(50),
    "budget_jc_tax" DECIMAL(12,2) DEFAULT 0,
    "budget_jc_tax_rate" DECIMAL(7,2) DEFAULT 0,
    "budget_njc_tax" DECIMAL(12,2) DEFAULT 0,
    "budget_njc_tax_rate" DECIMAL(7,2) DEFAULT 0,
    "po_supplier_id" UUID,
    "po_qty" DECIMAL(14,4) DEFAULT 0,
    "po_rate" DECIMAL(14,4) DEFAULT 0,
    "po_pretax" DECIMAL(14,2) DEFAULT 0,
    "po_tax_group" VARCHAR(50),
    "po_jc_tax" DECIMAL(12,2) DEFAULT 0,
    "po_jc_tax_rate" DECIMAL(7,2) DEFAULT 0,
    "po_njc_tax" DECIMAL(12,2) DEFAULT 0,
    "po_njc_tax_rate" DECIMAL(7,2) DEFAULT 0,
    "po_number" VARCHAR(40),
    "original_jc_category" VARCHAR(40),
    "added_after_finalized" BOOLEAN DEFAULT false,
    "budget_generated" BOOLEAN DEFAULT false,
    "budget_posting_batch" INTEGER,
    "po_gen_batch" INTEGER,
    "budget_deleted" BOOLEAN DEFAULT false,
    "po_deleted" BOOLEAN DEFAULT false,
    "budget_overridden" BOOLEAN DEFAULT false,
    "po_overridden" BOOLEAN DEFAULT false,
    "assembly_id" UUID,
    "assembly_description" VARCHAR(500),
    "floor_plan_code" VARCHAR(50),
    "room_location" VARCHAR(200),
    "sales_qty" DECIMAL(10,4),
    "region_id" UUID NOT NULL,
    "budget_posting_date" TIMESTAMPTZ(6),
    "variance_jc_cost_type" VARCHAR(20),
    "budget_rate1" DECIMAL(14,4) DEFAULT 0,
    "budget_qty1" DECIMAL(14,4) DEFAULT 0,
    "budget_rate2" DECIMAL(14,4) DEFAULT 0,
    "budget_qty2" DECIMAL(14,4) DEFAULT 0,
    "budget_rate3" DECIMAL(14,4) DEFAULT 0,
    "budget_qty3" DECIMAL(14,4) DEFAULT 0,
    "po_change_order" VARCHAR(50),
    "series" VARCHAR(50),
    "option_code" VARCHAR(50),
    "elevation_code" VARCHAR(50),
    "original_est_item_id" BIGINT DEFAULT 0,
    "home_id" UUID,
    "use_base_floor_plan_cost" BOOLEAN DEFAULT false,
    "use_elevation_cost" BOOLEAN DEFAULT false,
    "version_number" INTEGER DEFAULT 0,
    "child_item_list_id" UUID,
    "child_item_id" UUID,
    "child_item_description" VARCHAR(200),
    "child_item_rate" DECIMAL(14,4),
    "sub_child_list_id" UUID,
    "sub_child_item_id" UUID,
    "sub_child_item_description" VARCHAR(200),
    "sub_child_item_rate" DECIMAL(14,4),
    "estimating_db_item_id" UUID,
    "deleted_date" TIMESTAMPTZ(6),
    "deleted_by" UUID,
    "warranty_deficiency_id" INTEGER DEFAULT 0,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_estimate_items_pkey" PRIMARY KEY ("est_item_id")
);

-- CreateTable
CREATE TABLE "job_purchase_order_index" (
    "job_po_index_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "job_number" VARCHAR(50) NOT NULL,
    "unit_number" VARCHAR(50) NOT NULL,
    "po_index" VARCHAR(40) NOT NULL,
    "description" VARCHAR(200),
    "notes" TEXT,
    "standard_text" VARCHAR(2000),
    "hide_qty" BOOLEAN DEFAULT false,
    "hide_price" BOOLEAN DEFAULT false,
    "total_only" BOOLEAN DEFAULT false,
    "schedule_task_id" INTEGER,
    "release_task_id" INTEGER,
    "payment_term" INTEGER,
    "fob" VARCHAR(50),
    "ship_via" VARCHAR(50),
    "terms" TEXT,
    "retainage_percent" DECIMAL(9,2),
    "po_type" VARCHAR(15),
    "pay_point1_percent" DECIMAL(9,2) DEFAULT 100,
    "pay_point2_percent" DECIMAL(9,2),
    "pay_point3_percent" DECIMAL(9,2),
    "pay_point4_percent" DECIMAL(9,2),
    "pay_point5_percent" DECIMAL(9,2),
    "pay_point1_sched_task" INTEGER,
    "pay_point2_sched_task" INTEGER,
    "pay_point3_sched_task" INTEGER,
    "pay_point4_sched_task" INTEGER,
    "pay_point5_sched_task" INTEGER,
    "requires_payment_approval" BOOLEAN DEFAULT true,
    "mpo" BOOLEAN DEFAULT false,
    "use_in_scheduling" BOOLEAN DEFAULT true,
    "require_lien_release" BOOLEAN DEFAULT false,
    "last_po_seq" INTEGER,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_purchase_order_index_pkey" PRIMARY KEY ("job_po_index_id")
);

-- CreateTable
CREATE TABLE "job_unit_numbers" (
    "job_unit_number_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "job_number" VARCHAR(50) NOT NULL,
    "unit_number" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200),
    "community_id" UUID,
    "external_system_code" VARCHAR(50),
    "material_sales_tax_group" VARCHAR(50),
    "labor_sales_tax_group" VARCHAR(50),
    "subcontract_sales_tax_group" VARCHAR(50),
    "other_sales_tax_group" VARCHAR(50),
    "site_superintendent_id" UUID,
    "project_manager_id" UUID,
    "estimator_id" UUID,
    "warranty_rep_id" UUID,
    "warranty_service_rep_id" UUID,
    "schedule_template_id" UUID,
    "permit_applied_for_date" TIMESTAMPTZ(6),
    "permit_received_date" TIMESTAMPTZ(6),
    "permit_released_date" TIMESTAMPTZ(6),
    "permit_number" VARCHAR(50),
    "scheduled_start_date" TIMESTAMPTZ(6),
    "construction_start_date" TIMESTAMPTZ(6),
    "construction_stage" INTEGER DEFAULT 0,
    "floor" VARCHAR(20),
    "building" VARCHAR(20),
    "job_unit_number_status" VARCHAR(20),
    "home_id" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_unit_numbers_pkey" PRIMARY KEY ("job_unit_number_id")
);

-- CreateTable
CREATE TABLE "job_unit_numbers_custom_fields" (
    "job_unit_custom_field_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "job_number" VARCHAR(50) NOT NULL,
    "unit_number" VARCHAR(50) NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "field_value" TEXT,
    "field_type" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_unit_numbers_custom_fields_pkey" PRIMARY KEY ("job_unit_custom_field_id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "job_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "region_id" UUID NOT NULL,
    "builder_id" UUID NOT NULL,
    "job_number" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200),
    "community_id" UUID,
    "external_system_code" VARCHAR(50),
    "material_sales_tax_group" VARCHAR(50),
    "labor_sales_tax_group" VARCHAR(50),
    "subcontract_sales_tax_group" VARCHAR(50),
    "other_sales_tax_group" VARCHAR(50),
    "site_superintendent_id" UUID,
    "project_manager_id" UUID,
    "estimator_id" UUID,
    "warranty_rep_id" UUID,
    "warranty_service_rep_id" UUID,
    "schedule_template_id" UUID,
    "permit_applied_for_date" TIMESTAMP(6),
    "permit_received_date" TIMESTAMP(6),
    "permit_released_date" TIMESTAMP(6),
    "permit_number" VARCHAR(50),
    "scheduled_start_date" TIMESTAMP(6),
    "construction_start_date" TIMESTAMP(6),
    "construction_stage" INTEGER NOT NULL DEFAULT 0,
    "lot_inventory_id" UUID,
    "accounting_customer_id" UUID,
    "job_type" VARCHAR(50),
    "last_po_seq" INTEGER,
    "community_phase_code" VARCHAR(50),
    "sage_intacct_entity" VARCHAR(50),
    "sage_intacct_location" VARCHAR(50),
    "sage_intacct_department" VARCHAR(50),
    "geo_location" geography,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_pkey" PRIMARY KEY ("job_id")
);

-- CreateTable
CREATE TABLE "jobs_custom_fields" (
    "job_custom_field_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "job_number" VARCHAR(50) NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "field_value" TEXT,
    "field_type" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_custom_fields_pkey" PRIMARY KEY ("job_custom_field_id")
);

-- CreateTable
CREATE TABLE "lender_contacts" (
    "lender_contact_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "lender_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address1" VARCHAR(50),
    "address2" VARCHAR(50),
    "city" VARCHAR(50),
    "state" VARCHAR(50),
    "zip" VARCHAR(50),
    "home_phone" VARCHAR(50),
    "mobile_phone" VARCHAR(50),
    "work_phone" VARCHAR(50),
    "fax" VARCHAR(50),
    "email" VARCHAR(200),
    "inactive" BOOLEAN DEFAULT false,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lender_contacts_pkey" PRIMARY KEY ("lender_contact_id")
);

-- CreateTable
CREATE TABLE "lender_loan_draw_items" (
    "loan_draw_item_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "loan_draw_template_id" UUID NOT NULL,
    "loan_draw_item" VARCHAR(50) NOT NULL,
    "percentage" DECIMAL(7,2) DEFAULT 0,
    "schedule_master_task_id" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lender_loan_draw_items_pkey" PRIMARY KEY ("loan_draw_item_id")
);

-- CreateTable
CREATE TABLE "lender_loan_draw_templates" (
    "loan_draw_template_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "lender_id" UUID NOT NULL,
    "loan_draw_template_name" VARCHAR(100),
    "effective_date" TIMESTAMPTZ(6),
    "is_inactive" BOOLEAN DEFAULT false,
    "inactive_date" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lender_loan_draw_templates_pkey" PRIMARY KEY ("loan_draw_template_id")
);

-- CreateTable
CREATE TABLE "lenders" (
    "lender_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "lender_name" VARCHAR(100) NOT NULL,
    "address1" VARCHAR(50),
    "address2" VARCHAR(50),
    "city" VARCHAR(50),
    "state" VARCHAR(50),
    "zip" VARCHAR(50),
    "home_phone" VARCHAR(50),
    "mobile_phone" VARCHAR(50),
    "work_phone" VARCHAR(50),
    "fax" VARCHAR(50),
    "email" VARCHAR(200),
    "inactive" BOOLEAN DEFAULT false,
    "allow_loan_draws" BOOLEAN DEFAULT false,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "lender_code" VARCHAR(50),
    "contact_name" VARCHAR(100),
    "contact_phone" VARCHAR(50),
    "contact_email" VARCHAR(200),
    "contact_fax" VARCHAR(50),
    "country" VARCHAR(50) DEFAULT 'USA',
    "website" VARCHAR(200),
    "notes" TEXT,
    "is_preferred" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "lender_pkey" PRIMARY KEY ("lender_id")
);

-- CreateTable
CREATE TABLE "lien_templates" (
    "lien_template_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "template_name" VARCHAR(200) NOT NULL,
    "template_description" TEXT,
    "lien_type" VARCHAR(100),
    "state_code" VARCHAR(10),
    "template_content" TEXT,
    "required_fields" JSONB,
    "filing_deadline_days" INTEGER,
    "notice_period_days" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lien_templates_pkey" PRIMARY KEY ("lien_template_id")
);

-- CreateTable
CREATE TABLE "lien_waiver_details" (
    "lien_waiver_detail_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "lien_waiver_master_id" UUID NOT NULL,
    "po_master_id" UUID,
    "invoice_number" VARCHAR(50),
    "invoice_date" TIMESTAMPTZ(6),
    "invoice_amount" DECIMAL(12,2),
    "work_description" VARCHAR(500),
    "work_start_date" TIMESTAMPTZ(6),
    "work_end_date" TIMESTAMPTZ(6),
    "amount_waived" DECIMAL(12,2) NOT NULL,
    "amount_retained" DECIMAL(12,2) DEFAULT 0,
    "line_order" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lien_waiver_details_pkey" PRIMARY KEY ("lien_waiver_detail_id")
);

-- CreateTable
CREATE TABLE "lien_waiver_master" (
    "lien_waiver_master_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "job_id" UUID,
    "supplier_id" UUID NOT NULL,
    "waiver_number" VARCHAR(50) NOT NULL,
    "waiver_type" VARCHAR(100),
    "waiver_amount" DECIMAL(12,2) NOT NULL,
    "waiver_date" TIMESTAMPTZ(6) NOT NULL,
    "through_date" TIMESTAMPTZ(6),
    "property_description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "signed_date" TIMESTAMPTZ(6),
    "notarized_date" TIMESTAMPTZ(6),
    "filed_date" TIMESTAMPTZ(6),
    "is_executed" BOOLEAN DEFAULT false,
    "notes" TEXT,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lien_waiver_master_pkey" PRIMARY KEY ("lien_waiver_master_id")
);

-- CreateTable
CREATE TABLE "lot_custom_fields" (
    "lot_inventory_custom_field_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "lot_id" UUID NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "field_value" TEXT,
    "field_type" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lot_custom_fields_pkey" PRIMARY KEY ("lot_inventory_custom_field_id")
);

-- CreateTable
CREATE TABLE "lot_required_options" (
    "lot_inventory_required_option_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "lot_id" UUID NOT NULL,
    "option_id" UUID NOT NULL,
    "quantity" DECIMAL(10,2),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lot_required_options_pkey" PRIMARY KEY ("lot_inventory_required_option_id")
);

-- CreateTable
CREATE TABLE "lot_sales_history" (
    "lot_inventory_sales_history_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "lot_id" UUID NOT NULL,
    "audit_trail_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "description_of_event" VARCHAR(200),
    "quote_contract_id" UUID,
    "inventory_home_id" UUID,
    "lot_selling_price_old" DECIMAL(9,2),
    "lot_selling_price_new" DECIMAL(9,2),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lot_sales_history_pkey" PRIMARY KEY ("lot_inventory_sales_history_id")
);

-- CreateTable
CREATE TABLE "lot_status" (
    "lot_status_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "division_id" UUID NOT NULL,
    "lot_status" VARCHAR(50) NOT NULL,
    "lot_status_custom_desc" VARCHAR(50) NOT NULL,
    "color_code" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lot_status_pkey" PRIMARY KEY ("lot_status_id")
);

-- CreateTable
CREATE TABLE "lots" (
    "lot_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "community_phase_id" UUID NOT NULL,
    "lot_status" VARCHAR(50) NOT NULL,
    "lot" VARCHAR(50) NOT NULL,
    "block" VARCHAR(50) NOT NULL,
    "job_number" VARCHAR(50) NOT NULL,
    "legal_plan" VARCHAR(50) NOT NULL,
    "lot_info_tooltip" TEXT,
    "address1" VARCHAR(50),
    "address2" VARCHAR(50),
    "city" VARCHAR(50),
    "state" VARCHAR(50),
    "zip" VARCHAR(50),
    "legal_address" VARCHAR(50),
    "county" VARCHAR(50),
    "country" VARCHAR(50),
    "tract" VARCHAR(50),
    "floor_plan_id" UUID,
    "garage_orientation" VARCHAR(50),
    "purchased_from" VARCHAR(100),
    "purchase_price" DECIMAL(12,2),
    "is_available_for_sale" BOOLEAN DEFAULT true,
    "construction_stage" INTEGER DEFAULT 0,
    "lot_selling_price" DECIMAL(12,2),
    "selling_adjustment" DECIMAL(12,2),
    "direction_facing" VARCHAR(50),
    "building_floor" VARCHAR(50),
    "unit_number" VARCHAR(50),
    "legal_unit" VARCHAR(50),
    "monthly_hoa_fees" DECIMAL(9,2),
    "annual_hoa_fees" DECIMAL(9,2),
    "hoa_id" UUID,
    "comments" TEXT,
    "lot_type" VARCHAR(50),
    "front_length" DECIMAL(9,2),
    "back_length" DECIMAL(9,2),
    "left_side_length" DECIMAL(9,2),
    "right_side_length" DECIMAL(9,2),
    "exterior_color" VARCHAR(200),
    "rear_lot_inventory_id" UUID,
    "total_area" DECIMAL(9,2),
    "useable_area" DECIMAL(9,2),
    "left_side_lot_inventory_id" UUID,
    "right_side_lot_inventory_id" UUID,
    "plat" VARCHAR(50),
    "plat_book" VARCHAR(50),
    "plat_page" VARCHAR(50),
    "facing_lot_inventory_id" UUID,
    "quote_contract_id" UUID,
    "job_costed_value" DECIMAL(12,2),
    "inventory_home_id" UUID,
    "marketing_info" TEXT,
    "lender_id" UUID,
    "loan_draw_template_id" UUID,
    "total_loan_amount" DECIMAL(12,2) DEFAULT 0,
    "loan_draw_lot_payout" DECIMAL(12,2) DEFAULT 0,
    "home_id" UUID,
    "initial_loan_draw" DECIMAL(12,2) DEFAULT 0,
    "geo_location" geography,
    "lot_map_x_coordinate" DECIMAL(18,4),
    "lot_map_y_coordinate" DECIMAL(18,4),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "division_id" UUID,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("lot_id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "opportunity_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "division_id" UUID,
    "region_id" UUID,
    "contact1_id" UUID,
    "contact2_id" UUID,
    "contact3_id" UUID,
    "contact4_id" UUID,
    "contact5_id" UUID,
    "description" VARCHAR(200),
    "comments" TEXT,
    "rating_id" UUID,
    "sales_person_id" UUID,
    "external_source_id" UUID,
    "community_id" UUID,
    "realtor_id" UUID,
    "lender_id" UUID,
    "customer_id" UUID,
    "design_center_person_id" UUID,
    "created_by_online_shopping" BOOLEAN DEFAULT false,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("opportunity_id")
);

-- CreateTable
CREATE TABLE "opportunities_custom_fields" (
    "opportunity_custom_field_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "opportunity_id" UUID NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "field_value" TEXT,
    "field_type" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunities_custom_fields_pkey" PRIMARY KEY ("opportunity_custom_field_id")
);

-- CreateTable
CREATE TABLE "opportunity" (
    "opportunity_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID,
    "customer_id" UUID,
    "opportunity_name" VARCHAR(200) NOT NULL,
    "opportunity_type" VARCHAR(100),
    "source" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'new',
    "stage" VARCHAR(50),
    "probability_percent" DECIMAL(5,2),
    "estimated_value" DECIMAL(14,2),
    "expected_close_date" TIMESTAMPTZ(6),
    "actual_close_date" TIMESTAMPTZ(6),
    "lead_date" TIMESTAMPTZ(6),
    "first_contact_date" TIMESTAMPTZ(6),
    "last_contact_date" TIMESTAMPTZ(6),
    "assigned_to" UUID,
    "notes" TEXT,
    "lost_reason" VARCHAR(500),
    "competitor" VARCHAR(200),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunity_pkey" PRIMARY KEY ("opportunity_id")
);

-- CreateTable
CREATE TABLE "opportunity_custom_fields" (
    "opportunity_custom_field_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "opportunity_id" UUID NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "field_label" VARCHAR(200),
    "field_type" VARCHAR(50) NOT NULL,
    "field_value" TEXT,
    "field_order" INTEGER,
    "is_required" BOOLEAN DEFAULT false,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunity_custom_fields_pkey" PRIMARY KEY ("opportunity_custom_field_id")
);

-- CreateTable
CREATE TABLE "option_categories" (
    "option_category_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "option_category_code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(100),
    "margin_percentage" DECIMAL(6,2),
    "markup_percentage" DECIMAL(6,2) DEFAULT 0,
    "round_to" DECIMAL(6,2) DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_categories_pkey" PRIMARY KEY ("option_category_id")
);

-- CreateTable
CREATE TABLE "option_images" (
    "option_image_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "option_code" VARCHAR(50) NOT NULL,
    "community_id" UUID NOT NULL,
    "image_file" VARCHAR(200),
    "description" VARCHAR(200) NOT NULL,
    "sort_order" INTEGER,
    "image_path" VARCHAR(200),
    "storage_system_identifier" VARCHAR(200) NOT NULL,
    "inactive" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_images_pkey" PRIMARY KEY ("option_image_id")
);

-- CreateTable
CREATE TABLE "option_package_details" (
    "option_package_detail_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "option_package_id" UUID NOT NULL,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "elevation_code" VARCHAR(50) NOT NULL,
    "series" VARCHAR(50) NOT NULL,
    "option_code" VARCHAR(50) NOT NULL,
    "is_included_option" BOOLEAN DEFAULT false,
    "included_at_no_charge" BOOLEAN DEFAULT false,
    "quantity" DECIMAL(10,4),
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_package_details_pkey" PRIMARY KEY ("option_package_detail_id")
);

-- CreateTable
CREATE TABLE "option_packages" (
    "option_package_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "community_phase_id" UUID NOT NULL,
    "floor_plan_code" VARCHAR(50),
    "elevation_code" VARCHAR(50),
    "description" VARCHAR(500),
    "comments" TEXT,
    "internal_notes" TEXT,
    "is_included_option" BOOLEAN DEFAULT false,
    "included_at_no_charge" BOOLEAN DEFAULT false,
    "price" DECIMAL(12,4),
    "cost" DECIMAL(12,4),
    "last_price_change" TIMESTAMPTZ(6),
    "unit_of_measure" VARCHAR(50),
    "sales_worksheet" INTEGER,
    "inactive" BOOLEAN DEFAULT false,
    "inactive_date" TIMESTAMPTZ(6),
    "select_by_room" BOOLEAN DEFAULT false,
    "display_total_only" BOOLEAN DEFAULT false,
    "design_center_use_only" BOOLEAN DEFAULT false,
    "location" VARCHAR(200),
    "construction_stage_cutoff" INTEGER,
    "option_image_icon" VARCHAR(100),
    "warranty_info" TEXT,
    "restriction_warning" BOOLEAN DEFAULT false,
    "restriction_message" TEXT,
    "subcategory_code" VARCHAR(50),
    "category_code" VARCHAR(50),
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_packages_pkey" PRIMARY KEY ("option_package_id")
);

-- CreateTable
CREATE TABLE "option_room_size_changes" (
    "option_room_size_change_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "option_code" VARCHAR(50) NOT NULL,
    "room" VARCHAR(200) NOT NULL,
    "category_code" VARCHAR(50) NOT NULL,
    "subcategory_code" VARCHAR(50) NOT NULL,
    "unit_of_measure" VARCHAR(50) NOT NULL,
    "quantity" DECIMAL(10,4) NOT NULL,
    "is_inactive" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_room_size_changes_pkey" PRIMARY KEY ("option_room_size_change_id")
);

-- CreateTable
CREATE TABLE "option_rules" (
    "option_rule_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "community_phase_id" UUID NOT NULL,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "series" VARCHAR(50) NOT NULL,
    "option_code" VARCHAR(50) NOT NULL,
    "related_floor_plan_code" VARCHAR(50) NOT NULL,
    "related_series" VARCHAR(50) NOT NULL,
    "related_option_code" VARCHAR(50) NOT NULL,
    "rule_type" VARCHAR(50) NOT NULL,
    "use_same_qty" BOOLEAN DEFAULT false,
    "quantity" DECIMAL(10,4),
    "is_once_only" BOOLEAN DEFAULT false,
    "comments" TEXT,
    "include_at_no_charge" BOOLEAN DEFAULT false,
    "use_same_attributes" BOOLEAN DEFAULT false,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_rules_pkey" PRIMARY KEY ("option_rule_id")
);

-- CreateTable
CREATE TABLE "option_subcategories" (
    "option_subcategory_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "option_category_code" VARCHAR(50) NOT NULL,
    "option_subcategory_code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(100),
    "margin_percentage" DECIMAL(6,2),
    "markup_percentage" DECIMAL(6,2) DEFAULT 0,
    "round_to" DECIMAL(6,2) DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_subcategories_pkey" PRIMARY KEY ("option_subcategory_id")
);

-- CreateTable
CREATE TABLE "options" (
    "option_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "builder_id" UUID NOT NULL,
    "community_phase_id" UUID NOT NULL,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "elevation_code" VARCHAR(50) NOT NULL,
    "option_code" VARCHAR(50) NOT NULL,
    "series" VARCHAR(50) NOT NULL,
    "category_code" VARCHAR(50) NOT NULL,
    "sub_category_code" VARCHAR(50) NOT NULL,
    "unit_of_measure" VARCHAR(50),
    "assembly_id" UUID,
    "assembly_type_id" INTEGER,
    "description" VARCHAR(500) NOT NULL,
    "comments" TEXT,
    "internal_notes" TEXT,
    "product_number" VARCHAR(100),
    "product_name" VARCHAR(100),
    "product_brand" VARCHAR(100),
    "product_manufacturer" VARCHAR(100),
    "product_style_key" VARCHAR(100),
    "product_style_name" VARCHAR(100),
    "external_option_number" VARCHAR(50),
    "is_included_option" BOOLEAN NOT NULL DEFAULT false,
    "design_center_use_only" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(14,4),
    "cost" DECIMAL(14,4),
    "last_price_change" TIMESTAMP(6),
    "sales_price_sheet" INTEGER,
    "inactive" BOOLEAN NOT NULL DEFAULT false,
    "inactive_date" TIMESTAMP(6),
    "color_attribute_list_id" UUID,
    "color" VARCHAR(500),
    "style_attribute_list_id" UUID,
    "style" VARCHAR(500),
    "finish_attribute_list_id" UUID,
    "finish" VARCHAR(500),
    "other_attribute_list_id" UUID,
    "other" VARCHAR(500),
    "included_at_no_charge" BOOLEAN,
    "select_by_room" BOOLEAN,
    "display_total_only" BOOLEAN,
    "location" TEXT,
    "main_floor_size" DECIMAL(9,2),
    "lower_level_size" DECIMAL(9,2),
    "second_level_size" DECIMAL(9,2),
    "third_level_size" DECIMAL(9,2),
    "garage_size" DECIMAL(9,2),
    "room_size_adjustment" BOOLEAN,
    "construction_stage_cutoff" INTEGER,
    "option_image_icon" VARCHAR(100),
    "warranty_info" TEXT,
    "total_size" DECIMAL(9,2),
    "num_of_beds" DECIMAL(9,2),
    "num_of_baths" DECIMAL(9,2),
    "num_of_garages" DECIMAL(6,2),
    "restriction_warning" BOOLEAN NOT NULL DEFAULT false,
    "restriction_message" TEXT,
    "option_package_id" UUID,
    "no_commission_paid" BOOLEAN,
    "markup_percentage" DECIMAL(6,2),
    "margin_percentage" DECIMAL(6,2),
    "round_to" DECIMAL(6,2),
    "warranty_details" TEXT,
    "warranty_period_in_months" INTEGER,
    "is_deleted" BOOLEAN DEFAULT false,
    "deleted_date" TIMESTAMP(6),
    "deleted_by" UUID,
    "option_type" INTEGER,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "option_pkey" PRIMARY KEY ("option_id")
);

-- CreateTable
CREATE TABLE "po_correspondence" (
    "correspondence_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "po_master_id" UUID NOT NULL,
    "builder_supplier_id" UUID,
    "supplier_contact_id" UUID,
    "builders_user_id" UUID,
    "date_logged" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "sequence" BIGSERIAL NOT NULL,
    "comments" TEXT,
    "response_to_sequence" BIGINT NOT NULL DEFAULT 0,
    "document_id" UUID,
    "ip_address" VARCHAR(20),
    "geo_location" geometry,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "po_correspondence_pkey" PRIMARY KEY ("correspondence_id")
);

-- CreateTable
CREATE TABLE "po_group" (
    "po_group_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "po_group" VARCHAR(40) NOT NULL,
    "description" VARCHAR(200),
    "notes" TEXT,
    "jc_cost_code" VARCHAR(40),
    "jc_cost_type" VARCHAR(40),
    "forecast_percent_1" DECIMAL(9,2),
    "forecast_percent_2" DECIMAL(9,2),
    "forecast_percent_3" DECIMAL(9,2),
    "forecast_percent_4" DECIMAL(9,2),
    "forecast_percent_5" DECIMAL(9,2),
    "forecast_percent_6" DECIMAL(9,2),
    "forecast_percent_7" DECIMAL(9,2),
    "forecast_percent_8" DECIMAL(9,2),
    "forecast_percent_9" DECIMAL(9,2),
    "forecast_percent_10" DECIMAL(9,2),
    "forecast_percent_11" DECIMAL(9,2),
    "forecast_percent_12" DECIMAL(9,2),
    "compounding_forecasts" BOOLEAN DEFAULT false,
    "standard_text" VARCHAR(2000),
    "po_release_group" VARCHAR(20),
    "hide_qty" BOOLEAN DEFAULT false,
    "hide_price" BOOLEAN DEFAULT false,
    "total_only" BOOLEAN DEFAULT false,
    "po_report_format" VARCHAR(250),
    "payment_term" INTEGER,
    "fob" VARCHAR(50),
    "ship_via" VARCHAR(50),
    "terms" TEXT,
    "retainage_percent" DECIMAL(9,2),
    "po_type" VARCHAR(20),
    "pay_point_1_percent" DECIMAL(9,2),
    "pay_point_2_percent" DECIMAL(9,2),
    "pay_point_3_percent" DECIMAL(9,2),
    "pay_point_4_percent" DECIMAL(9,2),
    "pay_point_5_percent" DECIMAL(9,2),
    "pay_point_1_sched_task" INTEGER,
    "pay_point_2_sched_task" INTEGER,
    "pay_point_3_sched_task" INTEGER,
    "pay_point_4_sched_task" INTEGER,
    "pay_point_5_sched_task" INTEGER,
    "requires_payment_approval" BOOLEAN DEFAULT false,
    "mpo" BOOLEAN DEFAULT false,
    "use_in_scheduling" BOOLEAN DEFAULT false,
    "require_lien_release" BOOLEAN DEFAULT false,
    "schedule_master_task_id" UUID,
    "master_task_id_for_release" UUID,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_by" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_by" UUID,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "po_group_pkey" PRIMARY KEY ("po_group_id")
);

-- CreateTable
CREATE TABLE "po_items" (
    "po_items_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "po_master_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "po_number" VARCHAR(50) NOT NULL,
    "po_item_seq" BIGSERIAL NOT NULL,
    "line_number" INTEGER,
    "line_description" VARCHAR(200),
    "description" VARCHAR(200),
    "comments" TEXT,
    "mpo_qty" DECIMAL(14,4),
    "order_qty" DECIMAL(14,4),
    "order_uom" VARCHAR(20),
    "approved_co_qty" DECIMAL(14,4),
    "takeoff_qty" DECIMAL(14,4),
    "takeoff_uom" VARCHAR(50),
    "unit_cost" DECIMAL(14,4),
    "pretax_total_cost" DECIMAL(14,2),
    "approved_co_pretax_total" DECIMAL(14,2),
    "tax_group" VARCHAR(50),
    "jc_tax" DECIMAL(12,2),
    "jc_tax_approved_co" DECIMAL(12,2),
    "jc_tax_rate" DECIMAL(7,2),
    "njc_tax" DECIMAL(12,2),
    "njc_tax_approved_co" DECIMAL(12,2),
    "njc_tax_rate" DECIMAL(7,2),
    "dont_print" BOOLEAN DEFAULT false,
    "job_number" VARCHAR(50),
    "unit_number" VARCHAR(50),
    "jc_extra" VARCHAR(50),
    "jc_cost_code" VARCHAR(50),
    "jc_cost_type" VARCHAR(50),
    "est_item_id" BIGINT NOT NULL,
    "gen_batch" INTEGER,
    "sort_order" INTEGER,
    "part_number" VARCHAR(50),
    "variance_jc_cost_type" VARCHAR(50),
    "variance_pretax_total" DECIMAL(14,2),
    "variance_jc_tax" DECIMAL(12,2),
    "variance_njc_tax" DECIMAL(12,2),
    "variance_line_number" INTEGER,
    "external_id" VARCHAR(50),
    "po_index" VARCHAR(40) NOT NULL,
    "approved_for_payment_date" TIMESTAMP(6),
    "approved_for_payment_by" UUID,
    "pay_point_number" INTEGER,
    "home_selection_id" UUID,
    "inventory_home_id" UUID,
    "quote_contract_id" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "child_item_list_id" UUID,
    "child_item_id" UUID,
    "child_item_rate" DECIMAL(14,4),
    "sub_child_list_id" UUID,
    "sub_child_item_id" UUID,
    "sub_child_item_rate" DECIMAL(14,4),
    "estimating_db_item_id" UUID,
    "schedule_task_id" UUID,
    "co_adjusted_rate" DECIMAL(14,4),
    "co_adjusted_pretax_total" DECIMAL(14,2),
    "co_adjusted_jc_tax" DECIMAL(12,2),
    "co_adjusted_njc_tax" DECIMAL(12,2),
    "warranty_deficiency_id" INTEGER,
    "sage_intacct_item" VARCHAR(20),
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "po_items_pkey" PRIMARY KEY ("po_items_id")
);

-- CreateTable
CREATE TABLE "po_items_co" (
    "po_items_co_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "po_master_co_id" UUID NOT NULL,
    "po_items_id" UUID NOT NULL,
    "po_item_co_seq" BIGSERIAL NOT NULL,
    "line_number" INTEGER,
    "line_description" VARCHAR(200),
    "description" VARCHAR(200),
    "comments" TEXT,
    "mpo_qty" DECIMAL(14,4),
    "order_qty" DECIMAL(14,4),
    "order_uom" VARCHAR(20),
    "rate" DECIMAL(14,4),
    "pretax" DECIMAL(14,2),
    "approved_co_pretax" DECIMAL(14,2),
    "tax_group" VARCHAR(40),
    "jc_tax" DECIMAL(12,2),
    "jc_tax_approved_co" DECIMAL(12,2),
    "jc_tax_rate" DECIMAL(12,2),
    "njc_tax" DECIMAL(12,2),
    "njc_tax_approved_co" DECIMAL(12,2),
    "njc_tax_rate" DECIMAL(7,2),
    "dont_print" BOOLEAN DEFAULT false,
    "job_number" VARCHAR(50),
    "unit_number" VARCHAR(20),
    "jc_extra" VARCHAR(20),
    "jc_cost_code" VARCHAR(40),
    "jc_cost_type" VARCHAR(40),
    "estimating_db_item_id" UUID,
    "est_item_id" BIGINT NOT NULL,
    "gen_batch" INTEGER,
    "sort_order" INTEGER,
    "part_number" VARCHAR(50),
    "variance_jc_cost_type" VARCHAR(40),
    "variance_pretax" DECIMAL(14,2),
    "variance_jc_tax" DECIMAL(12,2),
    "variance_njc_tax" DECIMAL(12,2),
    "variance_line_number" INTEGER,
    "external_id" VARCHAR(50),
    "po_index" VARCHAR(40) NOT NULL,
    "approved_for_payment_date" TIMESTAMP(6),
    "approved_for_payment_by" UUID,
    "pay_point_number" INTEGER,
    "home_selection_id" UUID,
    "inventory_home_id" UUID,
    "quote_contract_id" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "child_item_list_id" UUID,
    "child_item_id" UUID,
    "sub_child_list_id" UUID,
    "sub_child_item_id" UUID,
    "sub_child_item_description" VARCHAR(200),
    "child_item_rate" DECIMAL(14,4),
    "sub_child_item_rate" DECIMAL(14,4),
    "sage_intacct_item" VARCHAR(20),
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "po_items_co_pkey" PRIMARY KEY ("po_items_co_id")
);

-- CreateTable
CREATE TABLE "po_master" (
    "po_master_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "po_number" VARCHAR(40) NOT NULL,
    "po_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "po_index" VARCHAR(40) NOT NULL,
    "description" VARCHAR(500),
    "job_number" VARCHAR(50),
    "unit_number" VARCHAR(50),
    "warranty_job" VARCHAR(50),
    "supplier" VARCHAR(50),
    "builder_supplier_id" UUID NOT NULL,
    "notes" TEXT,
    "hide_qty" BOOLEAN DEFAULT false,
    "hide_price" BOOLEAN DEFAULT false,
    "total_only" BOOLEAN DEFAULT false,
    "post_to_accounting_batch" INTEGER,
    "post_to_accounting_date" TIMESTAMPTZ(6),
    "cancelled" BOOLEAN DEFAULT false,
    "cancellation_sent" BOOLEAN DEFAULT false,
    "cancelled_by" UUID,
    "cancelled_date" TIMESTAMPTZ(6),
    "cancelled_notes" VARCHAR(500),
    "supplier_cancel_acknowledged_date" TIMESTAMPTZ(6),
    "supplier_cancel_acknowledged_user" UUID,
    "supplier_cancel_ip_address" VARCHAR(20),
    "delivery_method" VARCHAR(5),
    "delivery_date" TIMESTAMPTZ(6),
    "delivery_recipient" VARCHAR(50),
    "delivery_address" VARCHAR(500),
    "re_delivery_method" VARCHAR(5),
    "re_delivery_recipient" VARCHAR(50),
    "re_delivery_date" TIMESTAMPTZ(6),
    "re_delivery_address" VARCHAR(500),
    "due_date" TIMESTAMPTZ(6),
    "ship_via" VARCHAR(50),
    "fob" VARCHAR(50),
    "discount" DECIMAL(12,2),
    "terms" VARCHAR(500),
    "ordered_by" UUID,
    "completed_date" TIMESTAMPTZ(6),
    "approved_for_payment_by" UUID,
    "approved_for_payment_date" TIMESTAMPTZ(6),
    "next_invoice_seq" INTEGER,
    "is_purch_variance_po" BOOLEAN DEFAULT false,
    "sched_start_date" TIMESTAMPTZ(6),
    "sched_finish_date" TIMESTAMPTZ(6),
    "retainage_percent" DECIMAL(7,2),
    "include_documents" BOOLEAN DEFAULT false,
    "viewed_by_supplier" BOOLEAN DEFAULT false,
    "viewed_by_date" TIMESTAMPTZ(6),
    "viewed_by_supplier_user_id" UUID,
    "is_scheduling_vpo" BOOLEAN DEFAULT false,
    "summarized" BOOLEAN DEFAULT false,
    "supplier_released_to_date" TIMESTAMPTZ(6),
    "supplier_acknowledged_date" TIMESTAMPTZ(6),
    "supplier_acknowledged_user" UUID,
    "supplier_acknowledge_ip_address" VARCHAR(20),
    "supplier_work_complete_date" TIMESTAMPTZ(6),
    "supplier_invoice_number" VARCHAR(40),
    "supplier_invoice_date" TIMESTAMPTZ(6),
    "status" VARCHAR(20) DEFAULT 'Pending',
    "pay_point1_schedule_task_id" UUID,
    "pay_point2_schedule_task_id" UUID,
    "pay_point3_schedule_task_id" UUID,
    "pay_point4_schedule_task_id" UUID,
    "pay_point5_schedule_task_id" UUID,
    "pay_point1_approved_date" TIMESTAMPTZ(6),
    "pay_point2_approved_date" TIMESTAMPTZ(6),
    "pay_point3_approved_date" TIMESTAMPTZ(6),
    "pay_point4_approved_date" TIMESTAMPTZ(6),
    "pay_point5_approved_date" TIMESTAMPTZ(6),
    "date_sent_to_scheduling" TIMESTAMPTZ(6),
    "pay_point1_approved_by" UUID,
    "pay_point2_approved_by" UUID,
    "pay_point3_approved_by" UUID,
    "pay_point4_approved_by" UUID,
    "pay_point5_approved_by" UUID,
    "scheduling_assigned_supplier_id" UUID,
    "is_tbd" BOOLEAN DEFAULT false,
    "is_mpo" BOOLEAN DEFAULT false,
    "vpo_type" VARCHAR(10),
    "vpo_suffix" VARCHAR(10),
    "mpo_received" BOOLEAN DEFAULT false,
    "mpo_received_date" TIMESTAMPTZ(6),
    "intacct_jc_tax_line_id" INTEGER,
    "intacct_jc_tax_line_number" INTEGER,
    "intacct_njc_tax_line_id" INTEGER,
    "intacct_njc_tax_line_number" INTEGER,
    "vpo_doc_number" VARCHAR(40),
    "intacct_transaction_type" VARCHAR(20),
    "comments" TEXT,
    "is_variance" BOOLEAN DEFAULT false,
    "po_gen_batch" INTEGER,
    "po_icon_type" VARCHAR(2) DEFAULT '',
    "last_co" INTEGER,
    "variance_po_id" UUID,
    "wc_insurance_ok" BOOLEAN DEFAULT false,
    "gl_insurance_ok" BOOLEAN DEFAULT false,
    "lien_waiver_reqd" BOOLEAN DEFAULT false,
    "joint_check_payee_name" VARCHAR(200),
    "schedule_task_id" UUID,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "po_master_pkey" PRIMARY KEY ("po_master_id")
);

-- CreateTable
CREATE TABLE "po_master_co" (
    "po_master_co_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "po_master_id" UUID NOT NULL,
    "co_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "co_number" INTEGER NOT NULL,
    "description" VARCHAR(500),
    "notes" TEXT,
    "hide_qty" BOOLEAN DEFAULT false,
    "hide_price" BOOLEAN DEFAULT false,
    "total_only" BOOLEAN DEFAULT false,
    "post_to_accounting_batch" INTEGER,
    "post_to_accounting_date" TIMESTAMPTZ(6),
    "cancelled" BOOLEAN DEFAULT false,
    "cancellation_sent" BOOLEAN DEFAULT false,
    "cancelled_by" UUID,
    "cancelled_date" TIMESTAMPTZ(6),
    "cancelled_notes" VARCHAR(500),
    "supplier_cancel_acknowledged_date" TIMESTAMPTZ(6),
    "supplier_cancel_acknowledged_user" UUID,
    "supplier_cancel_ip_address" VARCHAR(20),
    "delivery_method" VARCHAR(5),
    "delivery_date" TIMESTAMPTZ(6),
    "delivery_recipient" VARCHAR(50),
    "delivery_address" VARCHAR(500),
    "re_delivery_method" VARCHAR(5),
    "re_delivery_recipient" VARCHAR(50),
    "re_delivery_date" TIMESTAMPTZ(6),
    "re_delivery_address" VARCHAR(500),
    "due_date" TIMESTAMPTZ(6),
    "ship_via" VARCHAR(50),
    "fob" VARCHAR(50),
    "discount" DECIMAL(10,2),
    "terms" VARCHAR(500),
    "ordered_by" UUID,
    "completed_date" TIMESTAMPTZ(6),
    "approved_for_payment_by" UUID,
    "approved_for_payment_date" TIMESTAMPTZ(6),
    "next_invoice_seq" INTEGER,
    "is_purch_variance_po" BOOLEAN DEFAULT false,
    "sched_start_date" TIMESTAMPTZ(6),
    "sched_finish_date" TIMESTAMPTZ(6),
    "retainage_percent" DECIMAL(7,2),
    "include_documents" BOOLEAN DEFAULT false,
    "viewed_by_supplier" BOOLEAN DEFAULT false,
    "viewed_by_date" TIMESTAMPTZ(6),
    "viewed_by_supplier_user_id" UUID,
    "is_scheduling_vpo" BOOLEAN DEFAULT false,
    "summarized" BOOLEAN DEFAULT false,
    "supplier_released_to_date" TIMESTAMPTZ(6),
    "supplier_acknowledged_date" TIMESTAMPTZ(6),
    "supplier_acknowledged_user" UUID,
    "supplier_acknowledge_ip_address" VARCHAR(20),
    "supplier_work_complete_date" TIMESTAMPTZ(6),
    "supplier_invoice_number" VARCHAR(40),
    "supplier_invoice_date" TIMESTAMPTZ(6),
    "status" VARCHAR(20) DEFAULT 'Pending',
    "pay_point1_schedule_task_id" UUID,
    "pay_point2_schedule_task_id" UUID,
    "pay_point3_schedule_task_id" UUID,
    "pay_point4_schedule_task_id" UUID,
    "pay_point5_schedule_task_id" UUID,
    "pay_point1_approved_date" TIMESTAMPTZ(6),
    "pay_point2_approved_date" TIMESTAMPTZ(6),
    "pay_point3_approved_date" TIMESTAMPTZ(6),
    "pay_point4_approved_date" TIMESTAMPTZ(6),
    "pay_point5_approved_date" TIMESTAMPTZ(6),
    "date_sent_to_scheduling" TIMESTAMPTZ(6),
    "pay_point1_approved_by" UUID,
    "pay_point2_approved_by" UUID,
    "pay_point3_approved_by" UUID,
    "pay_point4_approved_by" UUID,
    "pay_point5_approved_by" UUID,
    "epo_id" VARCHAR(40),
    "scheduling_assigned_supplier" VARCHAR(40),
    "is_tbd" BOOLEAN DEFAULT false,
    "is_mpo" BOOLEAN DEFAULT false,
    "vpo_type" VARCHAR(10),
    "vpo_suffix" VARCHAR(10),
    "mpo_received" BOOLEAN DEFAULT false,
    "mpo_received_date" TIMESTAMPTZ(6),
    "intacct_jc_tax_line_id" INTEGER,
    "intacct_jc_tax_line_number" INTEGER,
    "intacct_njc_tax_line_id" INTEGER,
    "intacct_njc_tax_line_number" INTEGER,
    "vpo_doc_number" VARCHAR(40),
    "intacct_transaction_type" VARCHAR(20),
    "comments" TEXT,
    "is_variance" BOOLEAN DEFAULT false,
    "po_icon_type" VARCHAR(2) DEFAULT '',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "po_master_co_pkey" PRIMARY KEY ("po_master_co_id")
);

-- CreateTable
CREATE TABLE "po_sequential_numbers" (
    "po_sequential_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "tstmp" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "po_number" SERIAL NOT NULL,

    CONSTRAINT "po_sequential_numbers_pkey" PRIMARY KEY ("po_sequential_id")
);

-- CreateTable
CREATE TABLE "po_viewing_history" (
    "viewing_history_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "po_master_id" UUID,
    "builder_supplier_id" UUID,
    "supplier_contact_id" UUID,
    "date_viewed" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "viewing_ip_address" VARCHAR(20),
    "viewing_geo_location" geometry,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "po_viewing_history_pkey" PRIMARY KEY ("viewing_history_id")
);

-- CreateTable
CREATE TABLE "posting_batches" (
    "batch_id" BIGSERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "batch_type" VARCHAR(50) NOT NULL,
    "batch_date" TIMESTAMP(6),
    "created_by" UUID NOT NULL,
    "posting_date" TIMESTAMP(6),
    "posting_status" VARCHAR(50),
    "posting_data_sent" TEXT,
    "posting_data_response" TEXT,
    "repost_batch_id" BIGINT,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posting_batches_pkey" PRIMARY KEY ("batch_id")
);

-- CreateTable
CREATE TABLE "quote_contract_co_master" (
    "quote_contract_co_master_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "quote_contract_id" UUID NOT NULL,
    "change_order_number" INTEGER NOT NULL,
    "co_date" TIMESTAMPTZ(6),
    "description" VARCHAR(500),
    "amount" DECIMAL(12,2),
    "status" VARCHAR(50),
    "approved_date" TIMESTAMPTZ(6),
    "approved_by" UUID,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_contract_co_master_pkey" PRIMARY KEY ("quote_contract_co_master_id")
);

-- CreateTable
CREATE TABLE "quote_contract_deposits" (
    "quote_contract_deposit_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "quote_contract_id" UUID NOT NULL,
    "deposit_type" VARCHAR(100) NOT NULL,
    "deposit_amount" DECIMAL(12,2) NOT NULL,
    "deposit_percentage" DECIMAL(5,2),
    "due_date" TIMESTAMPTZ(6),
    "received_date" TIMESTAMPTZ(6),
    "payment_method" VARCHAR(50),
    "check_number" VARCHAR(50),
    "reference_number" VARCHAR(100),
    "deposit_status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "is_refundable" BOOLEAN DEFAULT true,
    "refund_conditions" TEXT,
    "notes" TEXT,
    "processed_by" UUID,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_contract_deposits_pkey" PRIMARY KEY ("quote_contract_deposit_id")
);

-- CreateTable
CREATE TABLE "quote_contract_room_sizes" (
    "quote_contract_room_size_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "quote_contract_id" UUID NOT NULL,
    "room_name" VARCHAR(200) NOT NULL,
    "room_type" VARCHAR(100),
    "floor_level" VARCHAR(50),
    "length_feet" DECIMAL(8,2),
    "width_feet" DECIMAL(8,2),
    "area_square_feet" DECIMAL(10,2),
    "ceiling_height_feet" DECIMAL(6,2),
    "window_count" INTEGER,
    "door_count" INTEGER,
    "flooring_type" VARCHAR(100),
    "ceiling_type" VARCHAR(100),
    "wall_finish" VARCHAR(100),
    "electrical_outlets" INTEGER,
    "special_features" TEXT,
    "room_notes" TEXT,
    "room_order" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_contract_room_sizes_pkey" PRIMARY KEY ("quote_contract_room_size_id")
);

-- CreateTable
CREATE TABLE "quote_contracts" (
    "quote_contract_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID,
    "opportunity_id" UUID,
    "lot_inventory_id" UUID,
    "contract_number" VARCHAR(50),
    "contract_date" DATE,
    "contract_type" VARCHAR(50),
    "status" VARCHAR(50),
    "floor_plan_id" UUID,
    "elevation_id" UUID,
    "base_price" DECIMAL(12,2),
    "lot_premium" DECIMAL(12,2),
    "options_price" DECIMAL(12,2),
    "total_price" DECIMAL(12,2),
    "deposit_amount" DECIMAL(12,2),
    "deposit_received" DECIMAL(12,2),
    "financing_type" VARCHAR(50),
    "lender_id" UUID,
    "sales_person_id" UUID,
    "contract_signed_date" DATE,
    "estimated_close_date" DATE,
    "actual_close_date" DATE,
    "created_by" UUID NOT NULL,
    "modified_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_contracts_pkey" PRIMARY KEY ("quote_contract_id")
);

-- CreateTable
CREATE TABLE "quote_contracts_allowances" (
    "quote_contract_allowance_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "quote_contract_id" UUID NOT NULL,
    "allowance_category" VARCHAR(100) NOT NULL,
    "allowance_name" VARCHAR(200) NOT NULL,
    "allowance_description" TEXT,
    "allowance_amount" DECIMAL(12,2) NOT NULL,
    "allowance_type" VARCHAR(50) DEFAULT 'standard',
    "unit_of_measure" VARCHAR(50),
    "quantity" DECIMAL(10,4) DEFAULT 1,
    "unit_cost" DECIMAL(10,4),
    "is_taxable" BOOLEAN DEFAULT true,
    "tax_rate" DECIMAL(5,4),
    "is_used" BOOLEAN DEFAULT false,
    "used_amount" DECIMAL(12,2) DEFAULT 0,
    "remaining_amount" DECIMAL(12,2),
    "notes" TEXT,
    "allowance_order" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_contracts_allowances_pkey" PRIMARY KEY ("quote_contract_allowance_id")
);

-- CreateTable
CREATE TABLE "quote_contracts_custom_fields" (
    "quote_contract_custom_field_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "quote_contract_id" UUID NOT NULL,
    "field_name" VARCHAR(100) NOT NULL,
    "field_label" VARCHAR(200),
    "field_type" VARCHAR(50) NOT NULL,
    "field_value" TEXT,
    "field_options" JSONB,
    "field_validation" JSONB,
    "field_category" VARCHAR(100),
    "field_section" VARCHAR(100),
    "field_order" INTEGER,
    "is_required" BOOLEAN DEFAULT false,
    "is_visible" BOOLEAN DEFAULT true,
    "help_text" TEXT,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_contracts_custom_fields_pkey" PRIMARY KEY ("quote_contract_custom_field_id")
);

-- CreateTable
CREATE TABLE "room_master" (
    "room_master_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "room_location" VARCHAR(200) NOT NULL,
    "floor_level" VARCHAR(50),
    "inactive" BOOLEAN NOT NULL DEFAULT false,
    "inactive_date" TIMESTAMPTZ(6),
    "inactive_by" UUID,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_master_pkey" PRIMARY KEY ("room_master_id")
);

-- CreateTable
CREATE TABLE "room_subcategories" (
    "room_subcategory_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "room_location" VARCHAR(200) NOT NULL,
    "category_code" VARCHAR(20) NOT NULL,
    "subcategory_code" VARCHAR(20) NOT NULL,
    "unit_of_measure" VARCHAR(20) NOT NULL,
    "inactive" BOOLEAN NOT NULL DEFAULT false,
    "inactive_date" TIMESTAMPTZ(6),
    "inactive_by" UUID,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_subcategories_pkey" PRIMARY KEY ("room_subcategory_id")
);

-- CreateTable
CREATE TABLE "sage_intacct_departments" (
    "sage_department_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "department_id" VARCHAR(50) NOT NULL,
    "department_name" VARCHAR(100) NOT NULL,
    "parent_department_id" VARCHAR(50),
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sage_intacct_departments_pkey" PRIMARY KEY ("sage_department_id")
);

-- CreateTable
CREATE TABLE "sage_intacct_entities" (
    "sage_entity_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "entity_id" VARCHAR(50) NOT NULL,
    "entity_name" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50),
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sage_intacct_entities_pkey" PRIMARY KEY ("sage_entity_id")
);

-- CreateTable
CREATE TABLE "sage_intacct_locations" (
    "sage_location_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "location_id" VARCHAR(50) NOT NULL,
    "location_name" VARCHAR(100) NOT NULL,
    "parent_location_id" VARCHAR(50),
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sage_intacct_locations_pkey" PRIMARY KEY ("sage_location_id")
);

-- CreateTable
CREATE TABLE "sales_price_sheet_details" (
    "sales_price_sheet_detail_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "sales_price_sheet_master_id" UUID NOT NULL,
    "item_type" VARCHAR(50) NOT NULL,
    "item_id" UUID,
    "item_code" VARCHAR(100),
    "item_name" VARCHAR(200) NOT NULL,
    "item_description" TEXT,
    "base_price" DECIMAL(12,2),
    "sale_price" DECIMAL(12,2),
    "discount_amount" DECIMAL(12,2) DEFAULT 0,
    "discount_percent" DECIMAL(5,2) DEFAULT 0,
    "markup_percent" DECIMAL(5,2) DEFAULT 0,
    "cost" DECIMAL(12,2),
    "category" VARCHAR(100),
    "display_order" INTEGER,
    "is_taxable" BOOLEAN DEFAULT true,
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_price_sheet_details_pkey" PRIMARY KEY ("sales_price_sheet_detail_id")
);

-- CreateTable
CREATE TABLE "sales_price_sheet_master" (
    "sales_price_sheet_master_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID,
    "price_sheet_name" VARCHAR(200) NOT NULL,
    "price_sheet_description" TEXT,
    "effective_date" TIMESTAMPTZ(6) NOT NULL,
    "expiration_date" TIMESTAMPTZ(6),
    "version_number" VARCHAR(20),
    "is_active" BOOLEAN DEFAULT true,
    "approved_by" UUID,
    "approved_date" TIMESTAMPTZ(6),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_price_sheet_master_pkey" PRIMARY KEY ("sales_price_sheet_master_id")
);

-- CreateTable
CREATE TABLE "schedule_master_qc_items" (
    "qc_item_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "qc_section_id" INTEGER NOT NULL,
    "description" VARCHAR(200),
    "sort_order" INTEGER,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_master_qc_items_pkey" PRIMARY KEY ("qc_item_id")
);

-- CreateTable
CREATE TABLE "schedule_master_qc_lists" (
    "qc_list_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "description" VARCHAR(200),
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_master_qc_lists_pkey" PRIMARY KEY ("qc_list_id")
);

-- CreateTable
CREATE TABLE "schedule_master_qc_sections" (
    "qc_section_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "qc_list_id" INTEGER NOT NULL,
    "description" VARCHAR(200),
    "sort_order" INTEGER,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_master_qc_sections_pkey" PRIMARY KEY ("qc_section_id")
);

-- CreateTable
CREATE TABLE "schedule_master_task_list" (
    "schedule_master_task_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "description" VARCHAR(200),
    "parent_id" UUID,
    "index_in_parent" INTEGER,
    "duration" INTEGER,
    "lag_days" INTEGER,
    "jc_cost_code" VARCHAR(40),
    "qc_list_id" INTEGER,
    "sort_order" INTEGER,
    "display_level" INTEGER,
    "is_milestone" BOOLEAN DEFAULT false,
    "po_index" VARCHAR(40),
    "pay_point_number" INTEGER,
    "notice_lead_time" INTEGER,
    "notification_notes" VARCHAR(1000),
    "is_seasonal" BOOLEAN DEFAULT false,
    "construction_stage_cutoff" INTEGER,
    "prompt_user_to_take_photos" BOOLEAN DEFAULT false,
    "visible_to_customer" BOOLEAN DEFAULT false,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_master_task_list_pkey" PRIMARY KEY ("schedule_master_task_id")
);

-- CreateTable
CREATE TABLE "schedule_qc_sections" (
    "qc_section_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "schedule_task_id" UUID NOT NULL,
    "description" VARCHAR(50),
    "sort_order" INTEGER,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_qc_sections_pkey" PRIMARY KEY ("qc_section_id")
);

-- CreateTable
CREATE TABLE "schedule_task_activity_log" (
    "task_activity_log_id" BIGSERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "schedule_task_id" UUID,
    "po_number" VARCHAR(40),
    "entry_type" VARCHAR(20),
    "point_of_origin" INTEGER NOT NULL,
    "builder_user_id" UUID,
    "builders_supplier_id" UUID,
    "supplier_user_name" VARCHAR(200),
    "builder_comments" TEXT,
    "builder_comment_date" TIMESTAMP(6),
    "supplier_comments" TEXT,
    "supplier_comment_date" TIMESTAMP(6),
    "created_by" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "hide_on_supplier_portal" BOOLEAN DEFAULT false,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_task_activity_log_pkey" PRIMARY KEY ("task_activity_log_id")
);

-- CreateTable
CREATE TABLE "schedule_task_constraints" (
    "constraint_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "constraint_type" VARCHAR(10) NOT NULL,
    "schedule_task_id" UUID NOT NULL,
    "predecessor_task_id" UUID NOT NULL,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_task_constraints_pkey" PRIMARY KEY ("constraint_id")
);

-- CreateTable
CREATE TABLE "schedule_task_history_log" (
    "task_history_log_id" BIGSERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "schedule_task_id" UUID NOT NULL,
    "log_date" DATE,
    "log_entry_type" VARCHAR(20),
    "action" VARCHAR(50),
    "log_notes" TEXT,
    "builder_user_id" UUID,
    "supplier_status" VARCHAR(50),
    "builder_status" VARCHAR(50),
    "supplier_user_id" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_task_history_log_pkey" PRIMARY KEY ("task_history_log_id")
);

-- CreateTable
CREATE TABLE "schedule_task_notifications" (
    "notification_id" BIGSERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "schedule_task_id" UUID,
    "builders_supplier_id" UUID,
    "delivery_method_id" INTEGER,
    "delivery_address" VARCHAR(500),
    "delivery_date" TIMESTAMP(6),
    "current_start" TIMESTAMP(6),
    "current_finish" TIMESTAMP(6),
    "previous_start" TIMESTAMP(6),
    "previous_finish" TIMESTAMP(6),
    "notification_type_id" INTEGER,
    "created_by" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "hide_on_supplier_portal" BOOLEAN DEFAULT false,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_task_notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "schedule_task_qc_items" (
    "qc_item_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "schedule_task_id" UUID NOT NULL,
    "qc_section_id" INTEGER NOT NULL,
    "description" VARCHAR(200),
    "comments" VARCHAR(2000),
    "sort_order" INTEGER,
    "completed" BOOLEAN DEFAULT false,
    "completed_date" TIMESTAMP(6),
    "completed_by" UUID,
    "has_attachments" BOOLEAN DEFAULT false,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_task_qc_items_pkey" PRIMARY KEY ("qc_item_id")
);

-- CreateTable
CREATE TABLE "schedule_tasks" (
    "schedule_task_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "schedule_id" UUID NOT NULL,
    "job_number" VARCHAR(50),
    "unit_number" VARCHAR(20),
    "schedule_master_task_id" UUID NOT NULL,
    "user_supplied_code" VARCHAR(20),
    "parent_task_id" UUID,
    "index_in_parent" INTEGER,
    "display_level" INTEGER,
    "sort_order" INTEGER,
    "task_type" VARCHAR(10),
    "is_warranty_task" BOOLEAN DEFAULT false,
    "warranty_wo" BIGINT,
    "po_index" VARCHAR(40),
    "pay_point_number" INTEGER,
    "description" VARCHAR(200),
    "is_on_hold" BOOLEAN DEFAULT false,
    "on_hold_by" UUID,
    "on_hold_date" TIMESTAMP(6),
    "lock_task_dates" BOOLEAN DEFAULT false,
    "locked_by" UUID,
    "locked_date" TIMESTAMP(6),
    "expected_duration" INTEGER,
    "actual_duration" INTEGER,
    "lag_days" INTEGER,
    "qc_list_id" INTEGER,
    "original_supplier_id" UUID,
    "current_supplier_id" UUID,
    "internal_resource_id" UUID,
    "jc_cost_code" VARCHAR(40),
    "baseline_start" TIMESTAMP(6),
    "baseline_finish" TIMESTAMP(6),
    "expected_start" TIMESTAMP(6),
    "expected_finish" TIMESTAMP(6),
    "scheduled_start" TIMESTAMP(6),
    "scheduled_finish" TIMESTAMP(6),
    "actual_start" TIMESTAMP(6),
    "actual_finish" TIMESTAMP(6),
    "percent_complete" DECIMAL(5,2) DEFAULT 0,
    "comments" TEXT,
    "completed_date" TIMESTAMP(6),
    "completed_by" UUID,
    "is_milestone" BOOLEAN DEFAULT false,
    "is_scheduled" BOOLEAN DEFAULT false,
    "is_completed" BOOLEAN DEFAULT false,
    "constraint_type" VARCHAR(20),
    "variance_code" VARCHAR(10),
    "po_payment_approved" BOOLEAN DEFAULT false,
    "variance_notes" VARCHAR(1000),
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_tasks_pkey" PRIMARY KEY ("schedule_task_id")
);

-- CreateTable
CREATE TABLE "schedule_template_non_work_days" (
    "non_work_day_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "template_id" INTEGER NOT NULL,
    "working_days" INTEGER NOT NULL,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_template_non_work_days_pkey" PRIMARY KEY ("non_work_day_id")
);

-- CreateTable
CREATE TABLE "schedule_template_task_constraints" (
    "constraint_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "template_id" INTEGER NOT NULL,
    "task_id" UUID NOT NULL,
    "predecessor_task_id" UUID NOT NULL,
    "constraint_type" VARCHAR(20),
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_template_task_constraints_pkey" PRIMARY KEY ("constraint_id")
);

-- CreateTable
CREATE TABLE "schedule_template_tasks" (
    "schedule_master_task_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "template_id" INTEGER NOT NULL,
    "user_supplied_code" VARCHAR(20),
    "description" VARCHAR(200),
    "parent_id" UUID,
    "index_in_parent" INTEGER,
    "duration" INTEGER,
    "lag_days" INTEGER,
    "jc_cost_code" VARCHAR(40),
    "qc_list_id" INTEGER,
    "sort_order" INTEGER,
    "display_level" INTEGER,
    "is_milestone" BOOLEAN DEFAULT false,
    "is_seasonal" BOOLEAN DEFAULT false,
    "construction_stage_cutoff" INTEGER,
    "prompt_user_to_take_photos" BOOLEAN DEFAULT false,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_template_tasks_pkey" PRIMARY KEY ("schedule_master_task_id")
);

-- CreateTable
CREATE TABLE "schedule_templates" (
    "template_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "description" VARCHAR(200),
    "inactive" BOOLEAN DEFAULT false,
    "working_days" INTEGER,
    "calendar_days" INTEGER,
    "start_task_id" UUID,
    "finish_task_id" UUID,
    "dead_days_calculation_value" INTEGER,
    "rental_dead_days_calculation_value" INTEGER,
    "default_task_id_sort_order" INTEGER,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_templates_pkey" PRIMARY KEY ("template_id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "schedule_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID,
    "job_number" VARCHAR(50),
    "description" VARCHAR(200),
    "unit_number" VARCHAR(20),
    "quote_contract_id" UUID,
    "inventory_home_id" UUID,
    "template_id" INTEGER NOT NULL,
    "baseline_start" TIMESTAMP(6),
    "baseline_finish" TIMESTAMP(6),
    "expected_start" TIMESTAMP(6),
    "expected_finish" TIMESTAMP(6),
    "scheduled_start" TIMESTAMP(6),
    "scheduled_finish" TIMESTAMP(6),
    "actual_start" TIMESTAMP(6),
    "actual_finish" TIMESTAMP(6),
    "on_hold" BOOLEAN DEFAULT false,
    "on_hold_date" TIMESTAMP(6),
    "on_hold_by" UUID,
    "closed" BOOLEAN DEFAULT false,
    "inactive" BOOLEAN DEFAULT false,
    "created_by" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateTable
CREATE TABLE "scheduling_non_working_days" (
    "row_sequence" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "non_working_date" TIMESTAMP(6),
    "recurring_month" INTEGER,
    "recurring_day" INTEGER,
    "is_working_day" BOOLEAN DEFAULT false,
    "job_number" VARCHAR(40),
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduling_non_working_days_pkey" PRIMARY KEY ("row_sequence")
);

-- CreateTable
CREATE TABLE "scheduling_working_days" (
    "working_day_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduling_working_days_pkey" PRIMARY KEY ("working_day_id")
);

-- CreateTable
CREATE TABLE "default_suppliers" (
    "default_supplier_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "community_phase_code" VARCHAR(50) NOT NULL,
    "floor_plan_code" VARCHAR(50) NOT NULL,
    "po_index" VARCHAR(40) NOT NULL,
    "builder_supplier_id" UUID,
    "modified_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "default_suppliers_pkey" PRIMARY KEY ("default_supplier_id")
);

-- CreateTable
CREATE TABLE "digital_signature_roles" (
    "digital_signature_role_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "role_name" VARCHAR(100) NOT NULL,
    "role_description" VARCHAR(500),
    "signing_order" INTEGER,
    "is_required" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "digital_signature_roles_pkey" PRIMARY KEY ("digital_signature_role_id")
);

-- CreateTable
CREATE TABLE "divisions" (
    "division_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "division_code" VARCHAR(50) NOT NULL,
    "division_name" VARCHAR(100),
    "logo" VARCHAR(150),
    "address1" VARCHAR(50),
    "address2" VARCHAR(50),
    "city" VARCHAR(50),
    "state" VARCHAR(50),
    "zip" VARCHAR(50),
    "home_phone" VARCHAR(50),
    "mobile_phone" VARCHAR(50),
    "work_phone" VARCHAR(50),
    "fax" VARCHAR(50),
    "email" VARCHAR(200),
    "date_format" VARCHAR(50),
    "quote_expiry_days" INTEGER,
    "lot_hold_expiry_days" INTEGER,
    "lot_hold_num_of_days" INTEGER,
    "maps_api_key" VARCHAR(200),
    "time_zone_id" UUID,
    "business_hours_start" VARCHAR(50),
    "business_hours_end" VARCHAR(50),
    "casl" BOOLEAN DEFAULT false,
    "digital_signature_provider" VARCHAR(50),
    "estimated_close_date_days" INTEGER,
    "is_digital_signature_review_reqd" BOOLEAN DEFAULT false,
    "sort_options_by" VARCHAR(50),
    "external_provider_push_event_url" VARCHAR(200),
    "allow_multiple_quotes_on_lots" BOOLEAN DEFAULT false,
    "sales_manager_id" UUID,
    "sage_intacct_entity" VARCHAR(50),
    "sales_tax_rate" DECIMAL(10,4),
    "accounting_db_id" UUID,
    "local_time_zone_name" VARCHAR(40),
    "loan_draw_liability_acct" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("division_id")
);

-- CreateTable
CREATE TABLE "insurance_types" (
    "insurance_type_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "insurance_type" VARCHAR(50) NOT NULL,
    "description" VARCHAR(100) NOT NULL,
    "is_tracking" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurance_types_pkey" PRIMARY KEY ("insurance_type_id")
);

-- CreateTable
CREATE TABLE "payment_types" (
    "payment_type_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "description" VARCHAR(200) NOT NULL,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_types_pkey" PRIMARY KEY ("payment_type_id")
);

-- CreateTable
CREATE TABLE "real_estate_brokers" (
    "real_estate_broker_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "broker_name" VARCHAR(200) NOT NULL,
    "company_name" VARCHAR(200),
    "license_number" VARCHAR(50),
    "phone" VARCHAR(20),
    "mobile_phone" VARCHAR(20),
    "email" VARCHAR(200),
    "website" VARCHAR(500),
    "address_line1" VARCHAR(200),
    "address_line2" VARCHAR(200),
    "city" VARCHAR(100),
    "state" VARCHAR(50),
    "zip_code" VARCHAR(20),
    "commission_rate" DECIMAL(5,4),
    "is_preferred" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "notes" TEXT,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "real_estate_brokers_pkey" PRIMARY KEY ("real_estate_broker_id")
);

-- CreateTable
CREATE TABLE "realtors" (
    "realtor_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "real_estate_broker_id" UUID,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "license_number" VARCHAR(50),
    "phone" VARCHAR(20),
    "mobile_phone" VARCHAR(20),
    "email" VARCHAR(200),
    "website" VARCHAR(500),
    "specialties" VARCHAR(500),
    "commission_split" DECIMAL(5,4),
    "years_experience" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "notes" TEXT,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "realtors_pkey" PRIMARY KEY ("realtor_id")
);

-- CreateTable
CREATE TABLE "regions" (
    "region_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200),
    "manager_id" UUID,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "division_id" UUID NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("region_id")
);

-- CreateTable
CREATE TABLE "schema_migrations" (
    "version" VARCHAR(255) NOT NULL,
    "applied_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "shopping_cart_selection_sheet_response" (
    "shopping_cart_selection_response_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "customer_shopping_cart_id" UUID NOT NULL,
    "selection_sheet_question_id" UUID,
    "question_text" VARCHAR(500),
    "response_value" TEXT,
    "response_type" VARCHAR(50),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shopping_cart_selection_sheet_response_pkey" PRIMARY KEY ("shopping_cart_selection_response_id")
);

-- CreateTable
CREATE TABLE "system_user_audit" (
    "audit_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "from_builder_id" UUID,
    "to_builder_id" UUID,
    "session_token" VARCHAR(500),
    "ip_address" INET,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_user_audit_pkey" PRIMARY KEY ("audit_id")
);

-- CreateTable
CREATE TABLE "tax_groups" (
    "tax_group_id" SERIAL NOT NULL,
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "tax_group" VARCHAR(50) NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "njc_rate" DECIMAL(9,2),
    "jc_rate" DECIMAL(9,2),
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_groups_pkey" PRIMARY KEY ("tax_group_id")
);

-- CreateTable
CREATE TABLE "unit_of_measures" (
    "unit_of_measure" VARCHAR(50) NOT NULL,
    "description" VARCHAR(100),
    "abbreviation" VARCHAR(10),
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "unit_of_measures_pkey" PRIMARY KEY ("unit_of_measure")
);

-- CreateTable
CREATE TABLE "variance_po" (
    "variance_po_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "schedule_id" UUID,
    "vpo_request_date" TIMESTAMP(6),
    "po_index" VARCHAR(40),
    "builders_supplier_id" UUID,
    "description" VARCHAR(500),
    "comments" TEXT,
    "po_number" VARCHAR(40),
    "sequence" BIGSERIAL NOT NULL,
    "status" VARCHAR(20),
    "schedule_master_task_id" UUID,
    "schedule_task_id" UUID,
    "accounting_db_id" UUID,
    "vpo_reason" UUID,
    "vpo_notes" TEXT,
    "vpo_budget" DECIMAL(9,2),
    "start_date" TIMESTAMP(6),
    "lead_time" INTEGER,
    "duration" INTEGER,
    "supplier_comments" TEXT,
    "approved_by" UUID,
    "date_sent" TIMESTAMP(6),
    "date_received" TIMESTAMP(6),
    "date_approved" TIMESTAMP(6),
    "date_declined" TIMESTAMP(6),
    "back_charge_builder_supplier_id" UUID,
    "back_charge_comments" VARCHAR(2000),
    "purchaser_id" UUID,
    "internal_comments" TEXT,
    "show_internal_comments" BOOLEAN DEFAULT false,
    "delivery_date" TIMESTAMP(6),
    "sent_to_vendor_by" UUID,
    "delivery_address" VARCHAR(200),
    "created_by" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "create_schedule_task" BOOLEAN DEFAULT false,
    "is_seasonal" BOOLEAN DEFAULT false,
    "declined_by" UUID,
    "po_master_id" UUID,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "variance_po_pkey" PRIMARY KEY ("variance_po_id")
);

-- CreateTable
CREATE TABLE "selection_sheet_master" (
    "selection_sheet_master_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID,
    "community_id" UUID,
    "sheet_name" VARCHAR(200) NOT NULL,
    "sheet_description" TEXT,
    "sheet_type" VARCHAR(100),
    "version_number" VARCHAR(20),
    "effective_date" TIMESTAMPTZ(6),
    "expiration_date" TIMESTAMPTZ(6),
    "is_template" BOOLEAN DEFAULT true,
    "is_active" BOOLEAN DEFAULT true,
    "display_order" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "selection_sheet_master_pkey" PRIMARY KEY ("selection_sheet_master_id")
);

-- CreateTable
CREATE TABLE "selection_sheet_page" (
    "selection_sheet_page_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "selection_sheet_master_id" UUID NOT NULL,
    "page_name" VARCHAR(200) NOT NULL,
    "page_description" TEXT,
    "page_number" INTEGER NOT NULL,
    "page_instructions" TEXT,
    "is_required" BOOLEAN DEFAULT true,
    "display_order" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "selection_sheet_page_pkey" PRIMARY KEY ("selection_sheet_page_id")
);

-- CreateTable
CREATE TABLE "selection_sheet_question" (
    "selection_sheet_question_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "selection_sheet_section_id" UUID NOT NULL,
    "question_text" VARCHAR(500) NOT NULL,
    "question_type" VARCHAR(50) NOT NULL,
    "question_code" VARCHAR(100),
    "help_text" TEXT,
    "placeholder_text" VARCHAR(200),
    "validation_rules" JSONB,
    "available_options" JSONB,
    "default_value" VARCHAR(500),
    "question_number" INTEGER,
    "is_required" BOOLEAN DEFAULT false,
    "is_conditional" BOOLEAN DEFAULT false,
    "conditional_logic" JSONB,
    "display_order" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "selection_sheet_question_pkey" PRIMARY KEY ("selection_sheet_question_id")
);

-- CreateTable
CREATE TABLE "selection_sheet_response" (
    "selection_sheet_response_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "selection_sheet_question_id" UUID NOT NULL,
    "related_entity_type" VARCHAR(50),
    "related_entity_id" UUID,
    "response_value" TEXT,
    "response_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "respondent_name" VARCHAR(200),
    "respondent_email" VARCHAR(200),
    "is_final" BOOLEAN DEFAULT false,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "selection_sheet_response_pkey" PRIMARY KEY ("selection_sheet_response_id")
);

-- CreateTable
CREATE TABLE "selection_sheet_section" (
    "selection_sheet_section_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "selection_sheet_page_id" UUID NOT NULL,
    "section_name" VARCHAR(200) NOT NULL,
    "section_description" TEXT,
    "section_instructions" TEXT,
    "section_number" INTEGER NOT NULL,
    "is_required" BOOLEAN DEFAULT true,
    "display_order" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "selection_sheet_section_pkey" PRIMARY KEY ("selection_sheet_section_id")
);

-- CreateTable
CREATE TABLE "selection_sheet_sub_question1" (
    "selection_sheet_sub_question1_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "selection_sheet_question_id" UUID NOT NULL,
    "sub_question_text" VARCHAR(500) NOT NULL,
    "sub_question_type" VARCHAR(50) NOT NULL,
    "sub_question_code" VARCHAR(100),
    "help_text" TEXT,
    "available_options" JSONB,
    "default_value" VARCHAR(500),
    "is_required" BOOLEAN DEFAULT false,
    "display_order" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "selection_sheet_sub_question1_pkey" PRIMARY KEY ("selection_sheet_sub_question1_id")
);

-- CreateTable
CREATE TABLE "selection_sheet_sub_question2" (
    "selection_sheet_sub_question2_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "selection_sheet_sub_question1_id" UUID NOT NULL,
    "sub_question_text" VARCHAR(500) NOT NULL,
    "sub_question_type" VARCHAR(50) NOT NULL,
    "sub_question_code" VARCHAR(100),
    "help_text" TEXT,
    "available_options" JSONB,
    "default_value" VARCHAR(500),
    "is_required" BOOLEAN DEFAULT false,
    "display_order" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "selection_sheet_sub_question2_pkey" PRIMARY KEY ("selection_sheet_sub_question2_id")
);

-- CreateTable
CREATE TABLE "selection_sheet_sub_response1" (
    "selection_sheet_sub_response1_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "selection_sheet_response_id" UUID NOT NULL,
    "selection_sheet_sub_question1_id" UUID NOT NULL,
    "response_value" TEXT,
    "response_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "selection_sheet_sub_response1_pkey" PRIMARY KEY ("selection_sheet_sub_response1_id")
);

-- CreateTable
CREATE TABLE "selection_sheet_sub_response2" (
    "selection_sheet_sub_response2_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "selection_sheet_sub_response1_id" UUID NOT NULL,
    "selection_sheet_sub_question2_id" UUID NOT NULL,
    "response_value" TEXT,
    "response_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "selection_sheet_sub_response2_pkey" PRIMARY KEY ("selection_sheet_sub_response2_id")
);

-- CreateTable
CREATE TABLE "supplier_bid_assignments" (
    "supplier_bid_assignment_guid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "supplier_bid_id" SERIAL NOT NULL,
    "supplier_bid_guid" UUID NOT NULL,
    "builder_supplier_id" UUID NOT NULL,
    "assignment_status" VARCHAR(20) DEFAULT 'Assigned',
    "invite_sent_date" TIMESTAMP(6),
    "response_date" TIMESTAMP(6),
    "response_status" VARCHAR(20),
    "awarded" BOOLEAN DEFAULT false,
    "award_date" TIMESTAMP(6),
    "notes" TEXT,
    "created_by" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_by" UUID,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_bid_assignments_pkey" PRIMARY KEY ("supplier_bid_assignment_guid")
);

-- CreateTable
CREATE TABLE "supplier_bid_attachments" (
    "supplier_bid_attachment_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "supplier_bid_guid" UUID,
    "supplier_bid_assignment_guid" UUID,
    "supplier_bid_pricing_guid" UUID,
    "attachment_type" VARCHAR(20),
    "attachment_name" VARCHAR(255),
    "attachment_url" TEXT,
    "attachment_size" BIGINT,
    "attached_by" UUID,
    "attached_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "supplier_bid_attachments_pkey" PRIMARY KEY ("supplier_bid_attachment_id")
);

-- CreateTable
CREATE TABLE "supplier_bid_master" (
    "supplier_bid_guid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "supplier_bid_id" SERIAL NOT NULL,
    "bid_number" VARCHAR(20),
    "bid_description" VARCHAR(100),
    "bid_status" VARCHAR(20) DEFAULT 'Draft',
    "bid_type" VARCHAR(20),
    "region_id" UUID,
    "community_id" UUID,
    "job_number" VARCHAR(20),
    "due_date" TIMESTAMP(6),
    "bid_instructions" TEXT,
    "original_supplier_bid_guid" UUID,
    "is_active" BOOLEAN DEFAULT true,
    "created_by" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_by" UUID,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_bid_master_pkey" PRIMARY KEY ("supplier_bid_guid")
);

-- CreateTable
CREATE TABLE "supplier_bid_pricing" (
    "supplier_bid_pricing_guid" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "supplier_bid_pricing_id" BIGSERIAL NOT NULL,
    "supplier_bid_assignment_guid" UUID NOT NULL,
    "region_id" UUID,
    "community_id" UUID,
    "estimating_db_item_id" UUID,
    "assembly_id" UUID,
    "item_description" VARCHAR(255),
    "unit_of_measure" VARCHAR(50),
    "quantity" DECIMAL(19,4) DEFAULT 0,
    "unit_cost" DECIMAL(19,4) DEFAULT 0,
    "total_cost" DECIMAL(19,4) DEFAULT 0,
    "markup_percent" DECIMAL(19,4) DEFAULT 0,
    "unit_price" DECIMAL(19,4) DEFAULT 0,
    "total_price" DECIMAL(19,4) DEFAULT 0,
    "notes" TEXT,
    "is_selected" BOOLEAN DEFAULT false,
    "created_by" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_by" UUID,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_bid_pricing_pkey" PRIMARY KEY ("supplier_bid_pricing_guid")
);

-- CreateTable
CREATE TABLE "supplier_contacts" (
    "supplier_contact_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supplier_id" UUID NOT NULL,
    "supplier_contact_name" VARCHAR(100),
    "address1" VARCHAR(50),
    "address2" VARCHAR(50),
    "city" VARCHAR(50),
    "state" VARCHAR(10),
    "zip" VARCHAR(50),
    "created_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR(200),
    "work_phone" VARCHAR(20),
    "mobile_phone" VARCHAR(50),
    "fax" VARCHAR(50),
    "supplier_contact_login" VARCHAR(50),
    "supplier_contact_password" BYTEA,
    "salt" UUID,
    "purchasing_contact" BOOLEAN DEFAULT false,
    "scheduling_contact" BOOLEAN DEFAULT false,
    "warranty_contact" BOOLEAN DEFAULT false,
    "variance_po_contact" BOOLEAN DEFAULT false,
    "accounts_payable_contact" BOOLEAN DEFAULT false,
    "is_inactive" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "builder_id" UUID NOT NULL,

    CONSTRAINT "supplier_contacts_pkey" PRIMARY KEY ("supplier_contact_id")
);

-- CreateTable
CREATE TABLE "supplier_costs" (
    "supplier_cost_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "seq" BIGSERIAL NOT NULL,
    "builder_supplier_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "community_phase_code" VARCHAR(100),
    "floor_plan_code" VARCHAR(100),
    "elevation_code" VARCHAR(100),
    "option_code" VARCHAR(100),
    "version_number" INTEGER DEFAULT 1,
    "estimating_db_item_id" UUID,
    "unit_of_measure" VARCHAR(50),
    "base_cost" DECIMAL(19,4) DEFAULT 0,
    "overhead_percent" DECIMAL(19,4) DEFAULT 0,
    "profit_percent" DECIMAL(19,4) DEFAULT 0,
    "total_cost" DECIMAL(19,4) DEFAULT 0,
    "item_type" VARCHAR(50),
    "price_level" INTEGER,
    "effective_date" DATE,
    "expiration_date" DATE,
    "is_active" BOOLEAN DEFAULT true,
    "notes" TEXT,
    "created_by" UUID,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_by" UUID,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_costs_pkey" PRIMARY KEY ("supplier_cost_id")
);

-- CreateTable
CREATE TABLE "supplier_insurance" (
    "supplier_insurance_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "builders_supplier_id" UUID NOT NULL,
    "insurance_type_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID,
    "policy_number" VARCHAR(50),
    "policy_start_date" DATE,
    "policy_end_date" DATE,
    "coverage_amount" DECIMAL(19,2),
    "insurance_company" VARCHAR(100),
    "agent_name" VARCHAR(100),
    "agent_phone" VARCHAR(20),
    "agent_email" VARCHAR(100),
    "is_verified" BOOLEAN DEFAULT false,
    "verified_date" TIMESTAMP(6),
    "verified_by" UUID,
    "notes" TEXT,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_insurance_pkey" PRIMARY KEY ("supplier_insurance_id")
);

-- CreateTable
CREATE TABLE "supplier_po_group" (
    "supplier_po_group_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "builder_supplier_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "po_group" VARCHAR(25) NOT NULL,
    "description" VARCHAR(255),
    "is_active" BOOLEAN DEFAULT true,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_po_group_pkey" PRIMARY KEY ("supplier_po_group_id")
);

-- CreateTable
CREATE TABLE "supplier_tax_groups" (
    "supplier_tax_group_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "builders_supplier_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "tax_group_id" UUID,
    "tax_rate" DECIMAL(19,4) DEFAULT 0,
    "is_active" BOOLEAN DEFAULT true,
    "created_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "modified_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_tax_groups_pkey" PRIMARY KEY ("supplier_tax_group_id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "supplier_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "master_db_supplier_id" UUID,
    "accounting_db_id" UUID,
    "supplier_code" VARCHAR(50) NOT NULL,
    "supplier_contact_id" UUID,
    "supplier_name" VARCHAR(100),
    "address1" VARCHAR(50),
    "address2" VARCHAR(50),
    "city" VARCHAR(50),
    "state" VARCHAR(10),
    "zip" VARCHAR(50),
    "country" VARCHAR(50),
    "currency" VARCHAR(6) DEFAULT 'USD',
    "created_date" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "accounting_contact" VARCHAR(50),
    "accounting_email" VARCHAR(200),
    "work_phone" VARCHAR(50),
    "mobile_phone" VARCHAR(50),
    "fax" VARCHAR(50),
    "is_full_subscriber" BOOLEAN DEFAULT false,
    "full_subscriber_start_date" TIMESTAMPTZ(6),
    "supplier_company_email" VARCHAR(200),
    "is_inactive" BOOLEAN DEFAULT false,
    "tax_id_number" VARCHAR(50),
    "is_1099" BOOLEAN DEFAULT false,
    "is_t5018" BOOLEAN DEFAULT false,
    "discount_rate" DECIMAL(6,4),
    "deduction_rate" DECIMAL(6,4),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("supplier_id")
);

-- CreateTable
CREATE TABLE "ticket_attachments" (
    "attachment_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_size" BIGINT,
    "mime_type" VARCHAR(100),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_attachments_pkey" PRIMARY KEY ("attachment_id")
);

-- CreateTable
CREATE TABLE "ticket_categories" (
    "category_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "category_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7) DEFAULT '#6366f1',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "ticket_comments" (
    "comment_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "comment_text" TEXT NOT NULL,
    "is_internal" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "ticket_history" (
    "history_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "changed_by" UUID NOT NULL,
    "change_type" VARCHAR(50) NOT NULL,
    "field_name" VARCHAR(100),
    "old_value" TEXT,
    "new_value" TEXT,
    "change_description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "ticket_priorities" (
    "priority_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "priority_name" VARCHAR(50) NOT NULL,
    "priority_level" INTEGER NOT NULL,
    "color" VARCHAR(7) DEFAULT '#6b7280',
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_priorities_pkey" PRIMARY KEY ("priority_id")
);

-- CreateTable
CREATE TABLE "ticket_statuses" (
    "status_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "status_name" VARCHAR(50) NOT NULL,
    "status_type" VARCHAR(20) NOT NULL,
    "color" VARCHAR(7) DEFAULT '#6b7280',
    "is_default_for_type" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_statuses_pkey" PRIMARY KEY ("status_id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "ticket_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "ticket_number" VARCHAR(20) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "category_id" UUID,
    "priority_id" UUID,
    "status_id" UUID NOT NULL,
    "reported_by" UUID NOT NULL,
    "assigned_to" UUID,
    "related_job_id" UUID,
    "related_home_id" UUID,
    "related_community_id" UUID,
    "reported_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(6),
    "resolved_date" TIMESTAMP(6),
    "closed_date" TIMESTAMP(6),
    "estimated_hours" DECIMAL(8,2),
    "actual_hours" DECIMAL(8,2),
    "resolution_notes" TEXT,
    "internal_notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "user_communities" (
    "user_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "builder_id" UUID NOT NULL,
    "is_default" BOOLEAN DEFAULT false,
    "assigned_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" UUID,

    CONSTRAINT "user_communities_pkey" PRIMARY KEY ("user_id","community_id")
);

-- CreateTable
CREATE TABLE "user_default_regions" (
    "user_default_region_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_default_regions_pkey" PRIMARY KEY ("user_default_region_id")
);

-- CreateTable
CREATE TABLE "user_divisions" (
    "user_division_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "division_id" UUID NOT NULL,
    "builder_id" UUID NOT NULL,
    "access_level" VARCHAR(50) DEFAULT 'FULL',
    "assigned_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" UUID,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_divisions_pkey" PRIMARY KEY ("user_division_id")
);

-- CreateTable
CREATE TABLE "user_groups" (
    "user_group_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "auth_group_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_groups_pkey" PRIMARY KEY ("user_group_id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "user_permission_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "auth_permission_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("user_permission_id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "user_profile_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "builder_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(150),
    "last_name" VARCHAR(150),
    "phone" VARCHAR(50),
    "mobile_phone" VARCHAR(50),
    "role_id" UUID,
    "is_active" BOOLEAN DEFAULT true,
    "date_joined" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_profile_id")
);

-- CreateTable
CREATE TABLE "user_regions" (
    "user_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "builder_id" UUID NOT NULL,
    "date_created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "division_id" UUID,
    "is_default" BOOLEAN DEFAULT false,
    "access_level" VARCHAR(50) DEFAULT 'FULL',
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "user_regions_pkey" PRIMARY KEY ("user_id","region_id")
);

-- CreateTable
CREATE TABLE "user_role_assignments" (
    "user_role_assignment_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "builder_id" UUID,
    "assigned_date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" UUID,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_role_assignments_pkey" PRIMARY KEY ("user_role_assignment_id")
);

-- CreateTable
CREATE TABLE "user_role_permissions" (
    "role_id" UUID NOT NULL,
    "create_inventory_homes" BOOLEAN DEFAULT false,
    "create_custom_fields" BOOLEAN DEFAULT false,
    "create_selection_wizard" BOOLEAN DEFAULT false,
    "create_quotes_contracts" BOOLEAN DEFAULT false,
    "create_change_orders" BOOLEAN DEFAULT false,
    "approve_change_orders" BOOLEAN DEFAULT false,
    "edit_home_selections" BOOLEAN DEFAULT false,
    "unapprove_change_orders" BOOLEAN DEFAULT false,
    "approve_quotes_contracts" BOOLEAN DEFAULT false,
    "edit_actual_end_dates" BOOLEAN DEFAULT false,
    "create_schedules" BOOLEAN DEFAULT false,
    "create_schedule_templates" BOOLEAN DEFAULT false,
    "edit_estimating_item_db" BOOLEAN DEFAULT false,
    "create_estimating_assemblies" BOOLEAN DEFAULT false,
    "create_floor_plans" BOOLEAN DEFAULT false,
    "create_options" BOOLEAN DEFAULT false,
    "create_jobs" BOOLEAN DEFAULT false,
    "create_communities" BOOLEAN DEFAULT false,
    "create_divisions" BOOLEAN DEFAULT false,
    "edit_custom_sales_pricing" BOOLEAN DEFAULT false,
    "override_option_pricing" BOOLEAN DEFAULT false,
    "override_floor_plan_pricing" BOOLEAN DEFAULT false,
    "generate_pos" BOOLEAN DEFAULT false,
    "approve_pos_for_payment" BOOLEAN DEFAULT false,
    "create_budgets" BOOLEAN DEFAULT false,
    "create_pos" BOOLEAN DEFAULT false,
    "approve_variance_pos" BOOLEAN DEFAULT false,
    "create_variance_pos" BOOLEAN DEFAULT false,
    "post_budgets_to_accounting" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_role_permissions_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "role_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "description" VARCHAR(200) NOT NULL,
    "admin_role" BOOLEAN DEFAULT false,
    "sales_person_role" BOOLEAN DEFAULT false,
    "sales_manager_role" BOOLEAN DEFAULT false,
    "sales_associate_role" BOOLEAN DEFAULT false,
    "design_center_role" BOOLEAN DEFAULT false,
    "estimating_role" BOOLEAN DEFAULT false,
    "purchasing_role" BOOLEAN DEFAULT false,
    "accounting_role" BOOLEAN DEFAULT false,
    "site_superintendent_role" BOOLEAN DEFAULT false,
    "warranty_tech_role" BOOLEAN DEFAULT false,
    "warranty_admin_role" BOOLEAN DEFAULT false,
    "third_party_external_role" BOOLEAN DEFAULT false,
    "date_created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "system_admin_role" BOOLEAN DEFAULT false,
    "system_support_role" BOOLEAN DEFAULT false,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "session_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "active_builder_id" UUID,
    "session_token" VARCHAR(500),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(6),
    "is_active" BOOLEAN DEFAULT true,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID,
    "user_login_id" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(200),
    "first_name" VARCHAR(50),
    "middle_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "email_address" VARCHAR(100),
    "phone" VARCHAR(20),
    "role_id" UUID NOT NULL,
    "po_approval_limit" DECIMAL(9,2),
    "ap_invoice_entry_limit" DECIMAL(9,2),
    "ap_variance_limit" DECIMAL(9,2),
    "ap_invoice_approval_limit" DECIMAL(9,2),
    "ap_approval_routing_user_id" UUID,
    "vpo_approval_limit" DECIMAL(9,2),
    "vpo_approval_routing_user_id" UUID,
    "sales_approval_routing_user_id" UUID,
    "sales_associate_user_id" UUID,
    "inactive" BOOLEAN DEFAULT false,
    "inactive_date" TIMESTAMP(6),
    "salt" UUID DEFAULT uuid_generate_v4(),
    "hire_date" TIMESTAMP(6),
    "termination_date" TIMESTAMP(6),
    "notes" TEXT,
    "inactive_by" UUID,
    "default_region_id" UUID,
    "profile_image" VARCHAR(200),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "default_grid_page_size" INTEGER DEFAULT 50,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "warranty_problem_po_indexes" (
    "warranty_problem_po_index_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "warranty_problem_id" UUID NOT NULL,
    "po_master_id" UUID,
    "po_number" VARCHAR(50),
    "po_line_number" INTEGER,
    "item_description" VARCHAR(500),
    "quantity" DECIMAL(10,4),
    "unit_cost" DECIMAL(10,4),
    "total_cost" DECIMAL(12,2),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warranty_problem_po_indexes_pkey" PRIMARY KEY ("warranty_problem_po_index_id")
);

-- CreateTable
CREATE TABLE "warranty_problems" (
    "warranty_problem_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "community_id" UUID,
    "job_id" UUID,
    "home_id" UUID,
    "customer_id" UUID,
    "problem_number" VARCHAR(50) NOT NULL,
    "problem_title" VARCHAR(200) NOT NULL,
    "problem_description" TEXT NOT NULL,
    "problem_category" VARCHAR(100),
    "problem_type" VARCHAR(100),
    "severity" VARCHAR(20) DEFAULT 'medium',
    "priority" VARCHAR(20) DEFAULT 'medium',
    "status" VARCHAR(50) NOT NULL DEFAULT 'open',
    "reported_date" TIMESTAMPTZ(6) NOT NULL,
    "reported_by" VARCHAR(200),
    "assigned_to" UUID,
    "target_completion_date" TIMESTAMPTZ(6),
    "actual_completion_date" TIMESTAMPTZ(6),
    "location_description" VARCHAR(200),
    "room_location" VARCHAR(100),
    "trade" VARCHAR(100),
    "supplier_id" UUID,
    "estimated_cost" DECIMAL(10,2),
    "actual_cost" DECIMAL(10,2),
    "warranty_period_months" INTEGER,
    "warranty_start_date" TIMESTAMPTZ(6),
    "warranty_end_date" TIMESTAMPTZ(6),
    "is_covered_under_warranty" BOOLEAN DEFAULT true,
    "resolution_notes" TEXT,
    "customer_satisfaction_rating" INTEGER,
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warranty_problems_pkey" PRIMARY KEY ("warranty_problem_id")
);

-- CreateTable
CREATE TABLE "warranty_work_orders" (
    "warranty_work_order_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "builder_id" UUID NOT NULL,
    "warranty_problem_id" UUID NOT NULL,
    "work_order_number" VARCHAR(50) NOT NULL,
    "work_order_title" VARCHAR(200) NOT NULL,
    "work_order_description" TEXT,
    "work_order_type" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "priority" VARCHAR(20) DEFAULT 'medium',
    "scheduled_start_date" TIMESTAMPTZ(6),
    "scheduled_end_date" TIMESTAMPTZ(6),
    "actual_start_date" TIMESTAMPTZ(6),
    "actual_end_date" TIMESTAMPTZ(6),
    "assigned_supplier_id" UUID,
    "assigned_contact_id" UUID,
    "estimated_hours" DECIMAL(6,2),
    "actual_hours" DECIMAL(6,2),
    "estimated_cost" DECIMAL(10,2),
    "actual_cost" DECIMAL(10,2),
    "materials_cost" DECIMAL(10,2),
    "labor_cost" DECIMAL(10,2),
    "work_instructions" TEXT,
    "completion_notes" TEXT,
    "quality_check_passed" BOOLEAN,
    "customer_approval_required" BOOLEAN DEFAULT false,
    "customer_approved" BOOLEAN,
    "customer_approval_date" TIMESTAMPTZ(6),
    "created_by" UUID,
    "modified_by" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warranty_work_orders_pkey" PRIMARY KEY ("warranty_work_order_id")
);

-- CreateIndex
CREATE INDEX "idx_accounting_ap_payments_builder_id" ON "accounting_ap_payments"("builder_id");

-- CreateIndex
CREATE INDEX "idx_accounting_ap_payments_invoice_id" ON "accounting_ap_payments"("ap_invoice_id");

-- CreateIndex
CREATE INDEX "idx_accounting_databases_builder_id" ON "accounting_databases"("builder_id");

-- CreateIndex
CREATE INDEX "idx_accounting_gl_accounts_builder_id" ON "accounting_gl_accounts"("builder_id");

-- CreateIndex
CREATE INDEX "idx_accounting_gl_accounts_code" ON "accounting_gl_accounts"("account_code");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_gl_accounts_builder_id_account_code_key" ON "accounting_gl_accounts"("builder_id", "account_code");

-- CreateIndex
CREATE INDEX "idx_accounting_systems_builder_id" ON "accounting_systems"("builder_id");

-- CreateIndex
CREATE INDEX "idx_assembly_components_builder_id" ON "assembly_components"("builder_id");

-- CreateIndex
CREATE INDEX "idx_assembly_components_component_assembly_id" ON "assembly_components"("component_assembly_id");

-- CreateIndex
CREATE INDEX "idx_assembly_components_parent_assembly_id" ON "assembly_components"("parent_assembly_id");

-- CreateIndex
CREATE UNIQUE INDEX "assembly_components_parent_assembly_id_component_assembly_i_key" ON "assembly_components"("parent_assembly_id", "component_assembly_id");

-- CreateIndex
CREATE INDEX "idx_assembly_intersect_assemblies_assembly_id" ON "assembly_intersect_assemblies"("assembly_id");

-- CreateIndex
CREATE INDEX "idx_assembly_intersect_assemblies_builder_id" ON "assembly_intersect_assemblies"("builder_id");

-- CreateIndex
CREATE INDEX "idx_assembly_intersect_assemblies_intersect_id" ON "assembly_intersect_assemblies"("intersect_id");

-- CreateIndex
CREATE UNIQUE INDEX "assembly_intersect_assemblies_intersect_id_assembly_id_key" ON "assembly_intersect_assemblies"("intersect_id", "assembly_id");

-- CreateIndex
CREATE INDEX "idx_assembly_intersect_items_assembly_id" ON "assembly_intersect_items"("assembly_id");

-- CreateIndex
CREATE INDEX "idx_assembly_intersect_items_builder_id" ON "assembly_intersect_items"("builder_id");

-- CreateIndex
CREATE INDEX "idx_assembly_intersect_items_estimating_db_item_id" ON "assembly_intersect_items"("estimating_db_item_id");

-- CreateIndex
CREATE INDEX "idx_assembly_intersect_items_intersect_id" ON "assembly_intersect_items"("intersect_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_assembly_intersect_items_unique" ON "assembly_intersect_items"("intersect_id", "assembly_id", "estimating_db_item_id", "po_index", "takeoff_qty");

-- CreateIndex
CREATE INDEX "idx_assembly_intersections_builder_id" ON "assembly_intersections"("builder_id");

-- CreateIndex
CREATE INDEX "idx_assembly_intersections_region_id" ON "assembly_intersections"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "assembly_intersections_region_id_description_key" ON "assembly_intersections"("region_id", "description");

-- CreateIndex
CREATE INDEX "idx_assembly_items_assembly_id" ON "assembly_items"("assembly_id");

-- CreateIndex
CREATE INDEX "idx_assembly_items_builder_id" ON "assembly_items"("builder_id");

-- CreateIndex
CREATE INDEX "idx_assembly_items_community_id" ON "assembly_items"("community_id");

-- CreateIndex
CREATE INDEX "idx_assembly_items_estimating_db_item_id" ON "assembly_items"("estimating_db_item_id");

-- CreateIndex
CREATE INDEX "idx_assembly_master_assembly_code" ON "assembly_master"("assembly_code");

-- CreateIndex
CREATE INDEX "idx_assembly_master_builder_id" ON "assembly_master"("builder_id");

-- CreateIndex
CREATE INDEX "idx_assembly_master_community_id" ON "assembly_master"("community_id");

-- CreateIndex
CREATE INDEX "idx_assembly_master_is_current_version" ON "assembly_master"("is_current_version");

-- CreateIndex
CREATE INDEX "idx_assembly_master_region_id" ON "assembly_master"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_assembly_master" ON "assembly_master"("builder_id", "region_id", "assembly_code", "version_number");

-- CreateIndex
CREATE INDEX "idx_assembly_sales_pricing_assembly_id" ON "assembly_sales_pricing"("assembly_id");

-- CreateIndex
CREATE INDEX "idx_assembly_sales_pricing_assembly_type_id" ON "assembly_sales_pricing"("assembly_type_id");

-- CreateIndex
CREATE INDEX "idx_assembly_sales_pricing_builder_id" ON "assembly_sales_pricing"("builder_id");

-- CreateIndex
CREATE INDEX "idx_assembly_sales_pricing_community_id" ON "assembly_sales_pricing"("community_id");

-- CreateIndex
CREATE INDEX "idx_assembly_sales_pricing_community_phase_id" ON "assembly_sales_pricing"("community_phase_id");

-- CreateIndex
CREATE INDEX "idx_assembly_sales_pricing_elevation_code" ON "assembly_sales_pricing"("elevation_code");

-- CreateIndex
CREATE INDEX "idx_assembly_sales_pricing_floor_plan_code" ON "assembly_sales_pricing"("floor_plan_code");

-- CreateIndex
CREATE INDEX "idx_assembly_sales_pricing_option_code" ON "assembly_sales_pricing"("option_code");

-- CreateIndex
CREATE INDEX "idx_assembly_sales_pricing_option_package_id" ON "assembly_sales_pricing"("option_package_id");

-- CreateIndex
CREATE UNIQUE INDEX "assembly_sales_pricing_assembly_id_community_id_community_p_key" ON "assembly_sales_pricing"("assembly_id", "community_id", "community_phase_id", "floor_plan_code", "elevation_code", "option_code");

-- CreateIndex
CREATE INDEX "idx_auth_group_permissions_builder_id" ON "auth_group_permissions"("builder_id");

-- CreateIndex
CREATE INDEX "idx_auth_group_permissions_group_id" ON "auth_group_permissions"("auth_group_id");

-- CreateIndex
CREATE INDEX "idx_auth_group_permissions_permission_id" ON "auth_group_permissions"("auth_permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_group_permissions_auth_group_id_auth_permission_id_key" ON "auth_group_permissions"("auth_group_id", "auth_permission_id");

-- CreateIndex
CREATE INDEX "idx_auth_groups_builder_id" ON "auth_groups"("builder_id");

-- CreateIndex
CREATE INDEX "idx_auth_groups_name" ON "auth_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "auth_groups_builder_id_name_key" ON "auth_groups"("builder_id", "name");

-- CreateIndex
CREATE INDEX "idx_auth_permissions_builder_id" ON "auth_permissions"("builder_id");

-- CreateIndex
CREATE INDEX "idx_auth_permissions_codename" ON "auth_permissions"("codename");

-- CreateIndex
CREATE UNIQUE INDEX "auth_permissions_builder_id_codename_key" ON "auth_permissions"("builder_id", "codename");

-- CreateIndex
CREATE INDEX "idx_builders_created_at" ON "builders"("created_at");

-- CreateIndex
CREATE INDEX "idx_claim_template_items_builder_id" ON "claim_template_items"("builder_id");

-- CreateIndex
CREATE INDEX "idx_claim_template_items_template_id" ON "claim_template_items"("claim_template_id");

-- CreateIndex
CREATE INDEX "idx_claim_templates_builder_id" ON "claim_templates"("builder_id");

-- CreateIndex
CREATE INDEX "idx_claim_templates_type" ON "claim_templates"("claim_type");

-- CreateIndex
CREATE INDEX "idx_communities_builder_id" ON "communities"("builder_id");

-- CreateIndex
CREATE INDEX "idx_communities_region_id" ON "communities"("region_id");

-- CreateIndex
CREATE INDEX "idx_community_division_id" ON "communities"("division_id");

-- CreateIndex
CREATE UNIQUE INDEX "communities_region_id_community_code_key" ON "communities"("region_id", "community_code");

-- CreateIndex
CREATE INDEX "idx_communities_custom_fields_builder_id" ON "communities_custom_fields"("builder_id");

-- CreateIndex
CREATE INDEX "idx_communities_custom_fields_community_id" ON "communities_custom_fields"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "communities_custom_fields_community_id_field_name_key" ON "communities_custom_fields"("community_id", "field_name");

-- CreateIndex
CREATE INDEX "idx_community_phases_builder_id" ON "community_phase"("builder_id");

-- CreateIndex
CREATE INDEX "idx_community_phases_code" ON "community_phase"("community_phase_code");

-- CreateIndex
CREATE INDEX "idx_community_phases_community_id" ON "community_phase"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_phases_community_id_community_phase_code_key" ON "community_phase"("community_id", "community_phase_code");

-- CreateIndex
CREATE INDEX "idx_construction_stages_builder_id" ON "construction_stages"("builder_id");

-- CreateIndex
CREATE INDEX "idx_construction_stages_division_id" ON "construction_stages"("division_id");

-- CreateIndex
CREATE UNIQUE INDEX "construction_stages_builder_id_division_id_construction_sta_key" ON "construction_stages"("builder_id", "division_id", "construction_stage");

-- CreateIndex
CREATE INDEX "idx_contact_types_builder_id" ON "contact_types"("builder_id");

-- CreateIndex
CREATE UNIQUE INDEX "contact_types_builder_id_contact_type_key" ON "contact_types"("builder_id", "contact_type");

-- CreateIndex
CREATE INDEX "idx_contact_builder_id" ON "contacts"("builder_id");

-- CreateIndex
CREATE INDEX "idx_contacts_email" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "idx_contacts_name" ON "contacts"("last_name", "first_name");

-- CreateIndex
CREATE INDEX "idx_contacts_custom_fields_builder_id" ON "contacts_custom_fields"("builder_id");

-- CreateIndex
CREATE INDEX "idx_contacts_custom_fields_contact_id" ON "contacts_custom_fields"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_custom_fields_contact_id_field_name_key" ON "contacts_custom_fields"("contact_id", "field_name");

-- CreateIndex
CREATE INDEX "idx_cost_codes_builder_id" ON "cost_codes"("builder_id");

-- CreateIndex
CREATE INDEX "idx_standard_jc_cost_codes_accounting_db_id" ON "cost_codes"("accounting_db_id");

-- CreateIndex
CREATE INDEX "idx_standard_jc_cost_codes_jc_cost_code" ON "cost_codes"("cost_code");

-- CreateIndex
CREATE UNIQUE INDEX "uk_standard_jc_cost_codes" ON "cost_codes"("builder_id", "accounting_db_id", "cost_code");

-- CreateIndex
CREATE INDEX "idx_customer_shopping_cart_builder_id" ON "customer_shopping_cart"("builder_id");

-- CreateIndex
CREATE INDEX "idx_customer_shopping_cart_customer_id" ON "customer_shopping_cart"("customer_id");

-- CreateIndex
CREATE INDEX "idx_customer_shopping_cart_session_id" ON "customer_shopping_cart"("session_id");

-- CreateIndex
CREATE INDEX "idx_customers_builder_id" ON "customers"("builder_id");

-- CreateIndex
CREATE INDEX "idx_customers_region_id" ON "customers"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "customer_region_id_customer_id_key" ON "customers"("region_id", "customer_id");

-- CreateIndex
CREATE INDEX "idx_document_repository_builder_id" ON "document_repository"("builder_id");

-- CreateIndex
CREATE INDEX "idx_document_repository_category" ON "document_repository"("document_category");

-- CreateIndex
CREATE INDEX "idx_document_repository_related_entity" ON "document_repository"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE INDEX "idx_documents_and_attachments_builder_id" ON "documents_and_attachments"("builder_id");

-- CreateIndex
CREATE INDEX "idx_documents_and_attachments_related_entity" ON "documents_and_attachments"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE INDEX "idx_documents_and_attachments_repository_id" ON "documents_and_attachments"("document_repository_id");

-- CreateIndex
CREATE INDEX "idx_docusign_documents_builder_id" ON "docusign_documents"("builder_id");

-- CreateIndex
CREATE INDEX "idx_docusign_documents_envelope_id" ON "docusign_documents"("docusign_envelope_id");

-- CreateIndex
CREATE INDEX "idx_docusign_envelope_tabs_builder_id" ON "docusign_envelope_tabs"("builder_id");

-- CreateIndex
CREATE INDEX "idx_docusign_envelope_tabs_envelope_id" ON "docusign_envelope_tabs"("docusign_envelope_id");

-- CreateIndex
CREATE INDEX "idx_docusign_envelopes_builder_id" ON "docusign_envelopes"("builder_id");

-- CreateIndex
CREATE INDEX "idx_docusign_envelopes_envelope_id" ON "docusign_envelopes"("envelope_id");

-- CreateIndex
CREATE INDEX "idx_docusign_envelopes_related_entity" ON "docusign_envelopes"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "docusign_envelopes_builder_id_envelope_id_key" ON "docusign_envelopes"("builder_id", "envelope_id");

-- CreateIndex
CREATE INDEX "idx_docusign_oauth2_builder_id" ON "docusign_oauth2"("builder_id");

-- CreateIndex
CREATE INDEX "idx_docusign_recipient_event_log_builder_id" ON "docusign_recipient_event_log"("builder_id");

-- CreateIndex
CREATE INDEX "idx_docusign_recipient_event_log_envelope_id" ON "docusign_recipient_event_log"("docusign_envelope_id");

-- CreateIndex
CREATE INDEX "idx_docusign_recipient_event_log_recipient_id" ON "docusign_recipient_event_log"("recipient_id");

-- CreateIndex
CREATE INDEX "idx_docusign_recipient_status_builder_id" ON "docusign_recipient_status"("builder_id");

-- CreateIndex
CREATE INDEX "idx_docusign_recipient_status_envelope_id" ON "docusign_recipient_status"("docusign_envelope_id");

-- CreateIndex
CREATE INDEX "idx_docusign_role_tabs_builder_id" ON "docusign_role_tabs"("builder_id");

-- CreateIndex
CREATE INDEX "idx_docusign_role_tabs_role_id" ON "docusign_role_tabs"("digital_signature_role_id");

-- CreateIndex
CREATE INDEX "idx_elevation_images_builder_id" ON "elevation_images"("builder_id");

-- CreateIndex
CREATE INDEX "idx_elevation_images_codes" ON "elevation_images"("floor_plan_code", "elevation_code");

-- CreateIndex
CREATE INDEX "idx_elevation_room_sizes_builder_id" ON "elevation_room_sizes"("builder_id");

-- CreateIndex
CREATE INDEX "idx_elevation_room_sizes_codes" ON "elevation_room_sizes"("floor_plan_code", "elevation_code");

-- CreateIndex
CREATE UNIQUE INDEX "elevation_room_sizes_region_id_community_id_floor_plan_code_key" ON "elevation_room_sizes"("region_id", "community_id", "floor_plan_code", "elevation_code", "room_location", "category_code", "sub_category_code", "unit_of_measure");

-- CreateIndex
CREATE INDEX "idx_elevations_builder_id" ON "elevations"("builder_id");

-- CreateIndex
CREATE INDEX "idx_elevations_elevation_code" ON "elevations"("elevation_code");

-- CreateIndex
CREATE INDEX "idx_elevations_floor_plan_code" ON "elevations"("floor_plan_code");

-- CreateIndex
CREATE UNIQUE INDEX "elevations_region_id_community_id_community_phase_id_floor__key" ON "elevations"("region_id", "community_id", "community_phase_id", "floor_plan_code", "series");

-- CreateIndex
CREATE UNIQUE INDEX "elevations_region_id_floor_plan_code_elevation_code_key" ON "elevations"("region_id", "floor_plan_code", "elevation_code");

-- CreateIndex
CREATE INDEX "idx_estimating_db_child_item_lists_builder_id" ON "estimating_db_child_item_lists"("builder_id");

-- CreateIndex
CREATE INDEX "idx_estimating_db_child_item_lists_inactive" ON "estimating_db_child_item_lists"("inactive");

-- CreateIndex
CREATE INDEX "idx_estimating_db_child_item_lists_region_id" ON "estimating_db_child_item_lists"("region_id");

-- CreateIndex
CREATE INDEX "idx_estimating_db_child_list_items_builder_id" ON "estimating_db_child_list_items"("builder_id");

-- CreateIndex
CREATE INDEX "idx_estimating_db_child_list_items_child_item_id" ON "estimating_db_child_list_items"("child_item_id");

-- CreateIndex
CREATE INDEX "idx_estimating_db_child_list_items_child_item_list_id" ON "estimating_db_child_list_items"("child_item_list_id");

-- CreateIndex
CREATE INDEX "idx_estimating_db_child_list_items_inactive" ON "estimating_db_child_list_items"("inactive");

-- CreateIndex
CREATE UNIQUE INDEX "estimating_db_child_list_item_child_item_list_id_child_item_key" ON "estimating_db_child_list_items"("child_item_list_id", "child_item_id");

-- CreateIndex
CREATE INDEX "idx_estimating_db_groups_builder_id" ON "estimating_db_groups"("builder_id");

-- CreateIndex
CREATE INDEX "idx_estimating_db_groups_is_deleted" ON "estimating_db_groups"("is_deleted");

-- CreateIndex
CREATE INDEX "idx_estimating_db_groups_region_id" ON "estimating_db_groups"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "estimating_db_groups_region_id_estimating_db_group_key" ON "estimating_db_groups"("region_id", "estimating_db_group");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_builder_id" ON "estimating_db_items"("builder_id");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_code" ON "estimating_db_items"("estimating_db_item_code");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_cost_type" ON "estimating_db_items"("cost_type");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_group" ON "estimating_db_items"("estimating_db_group");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_inactive" ON "estimating_db_items"("inactive");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_is_deleted" ON "estimating_db_items"("is_deleted");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_item_id" ON "estimating_db_items"("item_id");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_jc_cost_code" ON "estimating_db_items"("jc_cost_code");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_jc_cost_type" ON "estimating_db_items"("jc_cost_type");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_option_category_code" ON "estimating_db_items"("option_category_code");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_option_code" ON "estimating_db_items"("option_code");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_po_index" ON "estimating_db_items"("po_index");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_region_id" ON "estimating_db_items"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_estimating_db_items" ON "estimating_db_items"("builder_id", "region_id", "estimating_db_group", "estimating_db_item_code");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_po_index_builder_id" ON "estimating_db_items_po_index"("builder_id");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_po_index_estimating_db_item_id" ON "estimating_db_items_po_index"("estimating_db_item_id");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_po_index_po_index" ON "estimating_db_items_po_index"("po_index");

-- CreateIndex
CREATE INDEX "idx_estimating_db_items_po_index_region_id" ON "estimating_db_items_po_index"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "estimating_db_items_po_index_region_id_estimating_db_item_i_key" ON "estimating_db_items_po_index"("region_id", "estimating_db_item_id", "po_index");

-- CreateIndex
CREATE UNIQUE INDEX "idx_estimating_db_items_po_index_unique" ON "estimating_db_items_po_index"("region_id", "estimating_db_item_id");

-- CreateIndex
CREATE INDEX "idx_field_label_templates_industry" ON "field_label_templates"("industry_type");

-- CreateIndex
CREATE INDEX "idx_field_label_templates_system" ON "field_label_templates"("is_system_template");

-- CreateIndex
CREATE INDEX "idx_field_labels_builder_id" ON "field_labels"("builder_id");

-- CreateIndex
CREATE INDEX "idx_field_labels_table_column" ON "field_labels"("table_name", "column_name");

-- CreateIndex
CREATE INDEX "idx_field_labels_table_name" ON "field_labels"("table_name");

-- CreateIndex
CREATE INDEX "idx_field_labels_visible" ON "field_labels"("is_visible");

-- CreateIndex
CREATE UNIQUE INDEX "field_labels_builder_id_table_name_column_name_key" ON "field_labels"("builder_id", "table_name", "column_name");

-- CreateIndex
CREATE INDEX "idx_floor_plan_community_builder_id" ON "floor_plan_community"("builder_id");

-- CreateIndex
CREATE INDEX "idx_floor_plan_community_code" ON "floor_plan_community"("floor_plan_code");

-- CreateIndex
CREATE INDEX "idx_floor_plan_community_community_id" ON "floor_plan_community"("community_id");

-- CreateIndex
CREATE INDEX "idx_floor_plan_images_builder_id" ON "floor_plan_images"("builder_id");

-- CreateIndex
CREATE INDEX "idx_floor_plan_images_floor_plan_code" ON "floor_plan_images"("floor_plan_code");

-- CreateIndex
CREATE INDEX "idx_floor_plan_master_builder_id" ON "floor_plan_master"("builder_id");

-- CreateIndex
CREATE INDEX "idx_floor_plan_master_code" ON "floor_plan_master"("floor_plan_code");

-- CreateIndex
CREATE INDEX "idx_floor_plan_master_region_id" ON "floor_plan_master"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "floor_plan_master_builder_id_region_id_floor_plan_code_key" ON "floor_plan_master"("builder_id", "region_id", "floor_plan_code");

-- CreateIndex
CREATE INDEX "idx_floor_plan_pricing_history_builder_id" ON "floor_plan_pricing_history"("builder_id");

-- CreateIndex
CREATE INDEX "idx_floor_plan_pricing_history_date" ON "floor_plan_pricing_history"("date_changed");

-- CreateIndex
CREATE INDEX "idx_floor_plan_pricing_history_floor_plan_id" ON "floor_plan_pricing_history"("floor_plan_id");

-- CreateIndex
CREATE INDEX "idx_floor_plan_room_sizes_builder_id" ON "floor_plan_room_sizes"("builder_id");

-- CreateIndex
CREATE INDEX "idx_floor_plan_room_sizes_floor_plan_code" ON "floor_plan_room_sizes"("floor_plan_code");

-- CreateIndex
CREATE UNIQUE INDEX "floor_plan_room_sizes_region_id_community_id_floor_plan_cod_key" ON "floor_plan_room_sizes"("region_id", "community_id", "floor_plan_code", "room_location", "category_code", "sub_category_code", "unit_of_measure");

-- CreateIndex
CREATE INDEX "idx_home_inspection_deficiencies_assigned_to" ON "home_inspection_deficiencies"("assigned_to");

-- CreateIndex
CREATE INDEX "idx_home_inspection_deficiencies_builder_id" ON "home_inspection_deficiencies"("builder_id");

-- CreateIndex
CREATE INDEX "idx_home_inspection_deficiencies_inspection_id" ON "home_inspection_deficiencies"("home_inspection_id");

-- CreateIndex
CREATE INDEX "idx_home_inspection_deficiencies_item_id" ON "home_inspection_deficiencies"("home_inspection_item_id");

-- CreateIndex
CREATE INDEX "idx_home_inspection_deficiencies_status" ON "home_inspection_deficiencies"("status");

-- CreateIndex
CREATE INDEX "idx_home_inspection_deficiencies_images_builder_id" ON "home_inspection_deficiencies_images"("builder_id");

-- CreateIndex
CREATE INDEX "idx_home_inspection_deficiencies_images_deficiency_id" ON "home_inspection_deficiencies_images"("home_inspection_deficiency_id");

-- CreateIndex
CREATE INDEX "idx_home_inspection_items_builder_id" ON "home_inspection_items"("builder_id");

-- CreateIndex
CREATE INDEX "idx_home_inspection_items_category" ON "home_inspection_items"("item_category");

-- CreateIndex
CREATE INDEX "idx_home_inspection_items_inspection_id" ON "home_inspection_items"("home_inspection_id");

-- CreateIndex
CREATE INDEX "idx_home_inspections_builder_id" ON "home_inspections"("builder_id");

-- CreateIndex
CREATE INDEX "idx_home_inspections_community_id" ON "home_inspections"("community_id");

-- CreateIndex
CREATE INDEX "idx_home_inspections_date" ON "home_inspections"("inspection_date");

-- CreateIndex
CREATE INDEX "idx_home_inspections_job_id" ON "home_inspections"("job_id");

-- CreateIndex
CREATE INDEX "idx_home_inspections_region_id" ON "home_inspections"("region_id");

-- CreateIndex
CREATE INDEX "idx_home_selection_sheet_response_builder_id" ON "home_selection_sheet_response"("builder_id");

-- CreateIndex
CREATE INDEX "idx_home_selection_sheet_response_home_id" ON "home_selection_sheet_response"("home_id");

-- CreateIndex
CREATE INDEX "idx_home_selection_sheet_response_job_id" ON "home_selection_sheet_response"("job_id");

-- CreateIndex
CREATE INDEX "idx_home_selection_sheet_response_question_id" ON "home_selection_sheet_response"("selection_sheet_question_id");

-- CreateIndex
CREATE INDEX "idx_home_selections_builder_id" ON "home_selections"("builder_id");

-- CreateIndex
CREATE INDEX "idx_home_selections_inventory_home_id" ON "home_selections"("inventory_home_id");

-- CreateIndex
CREATE INDEX "idx_home_selections_option_id" ON "home_selections"("option_id");

-- CreateIndex
CREATE INDEX "idx_home_selections_quote_contract_id" ON "home_selections"("quote_contract_id");

-- CreateIndex
CREATE INDEX "idx_homes_builder_id" ON "homes"("builder_id");

-- CreateIndex
CREATE INDEX "idx_homes_community_id" ON "homes"("community_id");

-- CreateIndex
CREATE INDEX "idx_homes_floor_plan_id" ON "homes"("floor_plan_id");

-- CreateIndex
CREATE INDEX "idx_inspection_checklist_items_builder_id" ON "inspection_checklist_items"("builder_id");

-- CreateIndex
CREATE INDEX "idx_inspection_checklist_items_category" ON "inspection_checklist_items"("item_category");

-- CreateIndex
CREATE INDEX "idx_inspection_checklist_items_checklist_id" ON "inspection_checklist_items"("inspection_checklist_id");

-- CreateIndex
CREATE INDEX "idx_inspection_checklists_builder_id" ON "inspection_checklists"("builder_id");

-- CreateIndex
CREATE INDEX "idx_inspection_checklists_region_id" ON "inspection_checklists"("region_id");

-- CreateIndex
CREATE INDEX "idx_inspection_checklists_type" ON "inspection_checklists"("inspection_type");

-- CreateIndex
CREATE INDEX "idx_inspection_deficiency_pick_lists_builder_id" ON "inspection_deficiency_pick_lists"("builder_id");

-- CreateIndex
CREATE INDEX "idx_inspection_deficiency_pick_lists_category" ON "inspection_deficiency_pick_lists"("deficiency_category");

-- CreateIndex
CREATE INDEX "idx_inspection_deficiency_pick_lists_code" ON "inspection_deficiency_pick_lists"("deficiency_code");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_deficiency_pick_li_builder_id_deficiency_categor_key" ON "inspection_deficiency_pick_lists"("builder_id", "deficiency_category", "deficiency_code");

-- CreateIndex
CREATE INDEX "idx_inspection_quality_grades_builder_id" ON "inspection_quality_grades"("builder_id");

-- CreateIndex
CREATE INDEX "idx_inspection_quality_grades_code" ON "inspection_quality_grades"("grade_code");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_quality_grades_builder_id_grade_code_key" ON "inspection_quality_grades"("builder_id", "grade_code");

-- CreateIndex
CREATE INDEX "idx_inventory_home_co_master_builder_id" ON "inventory_home_co_master"("builder_id");

-- CreateIndex
CREATE INDEX "idx_inventory_home_co_master_inventory_home_id" ON "inventory_home_co_master"("inventory_home_id");

-- CreateIndex
CREATE INDEX "idx_inventory_home_types_builder_id" ON "inventory_home_types"("builder_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_home_types_builder_id_inventory_home_type_key" ON "inventory_home_types"("builder_id", "inventory_home_type");

-- CreateIndex
CREATE INDEX "idx_inventory_homes_builder_id" ON "inventory_homes"("builder_id");

-- CreateIndex
CREATE INDEX "idx_inventory_homes_community_id" ON "inventory_homes"("community_id");

-- CreateIndex
CREATE INDEX "idx_inventory_homes_job_number" ON "inventory_homes"("job_number");

-- CreateIndex
CREATE INDEX "idx_inventory_homes_lot_inventory_id" ON "inventory_homes"("lot_inventory_id");

-- CreateIndex
CREATE INDEX "idx_inventory_homes_custom_fields_builder_id" ON "inventory_homes_custom_fields"("builder_id");

-- CreateIndex
CREATE INDEX "idx_inventory_homes_custom_fields_inventory_home_id" ON "inventory_homes_custom_fields"("inventory_home_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_homes_custom_fields_inventory_home_id_field_name_key" ON "inventory_homes_custom_fields"("inventory_home_id", "field_name");

-- CreateIndex
CREATE INDEX "idx_inventory_homes_room_sizes_builder_id" ON "inventory_homes_room_sizes"("builder_id");

-- CreateIndex
CREATE INDEX "idx_inventory_homes_room_sizes_inventory_home_id" ON "inventory_homes_room_sizes"("inventory_home_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_homes_room_sizes_inventory_home_id_room_sub_categ_key" ON "inventory_homes_room_sizes"("inventory_home_id", "room", "sub_category", "unit_of_measure");

-- CreateIndex
CREATE INDEX "idx_ap_invoice_items_builder_id" ON "ap_invoice_items"("builder_id");

-- CreateIndex
CREATE INDEX "idx_ap_invoice_items_invoice_id" ON "ap_invoice_items"("ap_invoice_id");

-- CreateIndex
CREATE INDEX "idx_ap_invoices_builder_id" ON "ap_invoices"("builder_id");

-- CreateIndex
CREATE INDEX "idx_ap_invoices_invoice_number" ON "ap_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "idx_ap_invoices_region_id" ON "ap_invoices"("region_id");

-- CreateIndex
CREATE INDEX "idx_ap_invoices_supplier_id" ON "ap_invoices"("supplier_id");

-- CreateIndex
CREATE INDEX "idx_job_estimate_items_builder_id" ON "job_estimate_items"("builder_id");

-- CreateIndex
CREATE INDEX "idx_job_estimate_items_home_selection_id" ON "job_estimate_items"("home_selection_id");

-- CreateIndex
CREATE INDEX "idx_job_estimate_items_job_unit" ON "job_estimate_items"("job_number", "unit_number");

-- CreateIndex
CREATE INDEX "idx_job_purchase_order_index_builder_id" ON "job_purchase_order_index"("builder_id");

-- CreateIndex
CREATE INDEX "idx_job_purchase_order_index_po_index" ON "job_purchase_order_index"("po_index");

-- CreateIndex
CREATE UNIQUE INDEX "job_purchase_order_index_region_id_job_number_unit_number_p_key" ON "job_purchase_order_index"("region_id", "job_number", "unit_number", "po_index");

-- CreateIndex
CREATE INDEX "idx_job_unit_numbers_builder_id" ON "job_unit_numbers"("builder_id");

-- CreateIndex
CREATE INDEX "idx_job_unit_numbers_job_unit" ON "job_unit_numbers"("job_number", "unit_number");

-- CreateIndex
CREATE UNIQUE INDEX "job_unit_numbers_region_id_job_number_unit_number_key" ON "job_unit_numbers"("region_id", "job_number", "unit_number");

-- CreateIndex
CREATE INDEX "idx_job_unit_numbers_custom_fields_builder_id" ON "job_unit_numbers_custom_fields"("builder_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_unit_numbers_custom_field_region_id_job_number_unit_num_key" ON "job_unit_numbers_custom_fields"("region_id", "job_number", "unit_number", "field_name");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_job_number_unique" ON "jobs"("job_number");

-- CreateIndex
CREATE INDEX "idx_job_builder_id" ON "jobs"("builder_id");

-- CreateIndex
CREATE INDEX "idx_job_community_id" ON "jobs"("community_id");

-- CreateIndex
CREATE INDEX "idx_job_job_number" ON "jobs"("job_number");

-- CreateIndex
CREATE INDEX "idx_job_region_id" ON "jobs"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "job_region_id_job_number_key" ON "jobs"("region_id", "job_number");

-- CreateIndex
CREATE INDEX "idx_jobs_custom_fields_builder_id" ON "jobs_custom_fields"("builder_id");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_custom_fields_region_id_job_number_field_name_key" ON "jobs_custom_fields"("region_id", "job_number", "field_name");

-- CreateIndex
CREATE INDEX "idx_lender_contacts_builder_id" ON "lender_contacts"("builder_id");

-- CreateIndex
CREATE INDEX "idx_lender_contacts_lender_id" ON "lender_contacts"("lender_id");

-- CreateIndex
CREATE UNIQUE INDEX "lender_contacts_lender_id_name_key" ON "lender_contacts"("lender_id", "name");

-- CreateIndex
CREATE INDEX "idx_lender_loan_draw_items_builder_id" ON "lender_loan_draw_items"("builder_id");

-- CreateIndex
CREATE INDEX "idx_lender_loan_draw_items_template_id" ON "lender_loan_draw_items"("loan_draw_template_id");

-- CreateIndex
CREATE UNIQUE INDEX "lender_loan_draw_items_loan_draw_template_id_loan_draw_item_key" ON "lender_loan_draw_items"("loan_draw_template_id", "loan_draw_item");

-- CreateIndex
CREATE INDEX "idx_lender_loan_draw_templates_builder_id" ON "lender_loan_draw_templates"("builder_id");

-- CreateIndex
CREATE INDEX "idx_lender_loan_draw_templates_lender_id" ON "lender_loan_draw_templates"("lender_id");

-- CreateIndex
CREATE UNIQUE INDEX "lender_loan_draw_templates_lender_id_loan_draw_template_id_key" ON "lender_loan_draw_templates"("lender_id", "loan_draw_template_id");

-- CreateIndex
CREATE INDEX "idx_lenders_builder_id" ON "lenders"("builder_id");

-- CreateIndex
CREATE INDEX "idx_lenders_region_id" ON "lenders"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_lender_code_per_region" ON "lenders"("region_id", "lender_code");

-- CreateIndex
CREATE INDEX "idx_lien_templates_builder_id" ON "lien_templates"("builder_id");

-- CreateIndex
CREATE INDEX "idx_lien_templates_state" ON "lien_templates"("state_code");

-- CreateIndex
CREATE INDEX "idx_lien_templates_type" ON "lien_templates"("lien_type");

-- CreateIndex
CREATE INDEX "idx_lien_waiver_details_builder_id" ON "lien_waiver_details"("builder_id");

-- CreateIndex
CREATE INDEX "idx_lien_waiver_details_master_id" ON "lien_waiver_details"("lien_waiver_master_id");

-- CreateIndex
CREATE INDEX "idx_lien_waiver_details_po_master_id" ON "lien_waiver_details"("po_master_id");

-- CreateIndex
CREATE INDEX "idx_lien_waiver_master_builder_id" ON "lien_waiver_master"("builder_id");

-- CreateIndex
CREATE INDEX "idx_lien_waiver_master_job_id" ON "lien_waiver_master"("job_id");

-- CreateIndex
CREATE INDEX "idx_lien_waiver_master_status" ON "lien_waiver_master"("status");

-- CreateIndex
CREATE INDEX "idx_lien_waiver_master_supplier_id" ON "lien_waiver_master"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "lien_waiver_master_builder_id_waiver_number_key" ON "lien_waiver_master"("builder_id", "waiver_number");

-- CreateIndex
CREATE INDEX "idx_lot_custom_fields_builder_id" ON "lot_custom_fields"("builder_id");

-- CreateIndex
CREATE INDEX "idx_lot_custom_fields_lot_id" ON "lot_custom_fields"("lot_id");

-- CreateIndex
CREATE UNIQUE INDEX "lot_inventory_custom_fields_lot_inventory_id_field_name_key" ON "lot_custom_fields"("lot_id", "field_name");

-- CreateIndex
CREATE INDEX "idx_lot_required_options_builder_id" ON "lot_required_options"("builder_id");

-- CreateIndex
CREATE INDEX "idx_lot_required_options_lot_id" ON "lot_required_options"("lot_id");

-- CreateIndex
CREATE UNIQUE INDEX "lot_inventory_required_options_lot_inventory_id_option_id_key" ON "lot_required_options"("lot_id", "option_id");

-- CreateIndex
CREATE INDEX "idx_lot_inventory_sales_history_date" ON "lot_sales_history"("audit_trail_date");

-- CreateIndex
CREATE INDEX "idx_lot_sales_history_builder_id" ON "lot_sales_history"("builder_id");

-- CreateIndex
CREATE INDEX "idx_lot_sales_history_lot_id" ON "lot_sales_history"("lot_id");

-- CreateIndex
CREATE INDEX "idx_lot_status_builder_id" ON "lot_status"("builder_id");

-- CreateIndex
CREATE INDEX "idx_lot_status_division_id" ON "lot_status"("division_id");

-- CreateIndex
CREATE UNIQUE INDEX "lot_status_builder_id_division_id_lot_status_key" ON "lot_status"("builder_id", "division_id", "lot_status");

-- CreateIndex
CREATE INDEX "idx_lot_geo_location" ON "lots" USING GIST ("geo_location");

-- CreateIndex
CREATE INDEX "idx_lot_job_number" ON "lots"("job_number");

-- CreateIndex
CREATE INDEX "idx_lot_lot_block" ON "lots"("lot", "block");

-- CreateIndex
CREATE INDEX "idx_lots_builder_id" ON "lots"("builder_id");

-- CreateIndex
CREATE INDEX "idx_lots_community_id" ON "lots"("community_id");

-- CreateIndex
CREATE INDEX "idx_lots_division_id" ON "lots"("division_id");

-- CreateIndex
CREATE INDEX "idx_opportunities_builder_id" ON "opportunities"("builder_id");

-- CreateIndex
CREATE INDEX "idx_opportunities_community_id" ON "opportunities"("community_id");

-- CreateIndex
CREATE INDEX "idx_opportunities_contacts" ON "opportunities"("contact1_id");

-- CreateIndex
CREATE INDEX "idx_opportunities_sales_person" ON "opportunities"("sales_person_id");

-- CreateIndex
CREATE INDEX "idx_opportunities_custom_fields_builder_id" ON "opportunities_custom_fields"("builder_id");

-- CreateIndex
CREATE INDEX "idx_opportunities_custom_fields_opportunity_id" ON "opportunities_custom_fields"("opportunity_id");

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_custom_fields_opportunity_id_field_name_key" ON "opportunities_custom_fields"("opportunity_id", "field_name");

-- CreateIndex
CREATE INDEX "idx_opportunity_assigned_to" ON "opportunity"("assigned_to");

-- CreateIndex
CREATE INDEX "idx_opportunity_builder_id" ON "opportunity"("builder_id");

-- CreateIndex
CREATE INDEX "idx_opportunity_community_id" ON "opportunity"("community_id");

-- CreateIndex
CREATE INDEX "idx_opportunity_customer_id" ON "opportunity"("customer_id");

-- CreateIndex
CREATE INDEX "idx_opportunity_region_id" ON "opportunity"("region_id");

-- CreateIndex
CREATE INDEX "idx_opportunity_status" ON "opportunity"("status");

-- CreateIndex
CREATE INDEX "idx_opportunity_custom_fields_builder_id" ON "opportunity_custom_fields"("builder_id");

-- CreateIndex
CREATE INDEX "idx_opportunity_custom_fields_opportunity_id" ON "opportunity_custom_fields"("opportunity_id");

-- CreateIndex
CREATE INDEX "idx_option_categories_builder_id" ON "option_categories"("builder_id");

-- CreateIndex
CREATE INDEX "idx_option_categories_code" ON "option_categories"("option_category_code");

-- CreateIndex
CREATE UNIQUE INDEX "option_categories_region_id_option_category_code_key" ON "option_categories"("region_id", "option_category_code");

-- CreateIndex
CREATE INDEX "idx_option_images_builder_id" ON "option_images"("builder_id");

-- CreateIndex
CREATE INDEX "idx_option_images_codes" ON "option_images"("floor_plan_code", "option_code");

-- CreateIndex
CREATE INDEX "idx_option_package_details_builder_id" ON "option_package_details"("builder_id");

-- CreateIndex
CREATE INDEX "idx_option_package_details_package_id" ON "option_package_details"("option_package_id");

-- CreateIndex
CREATE UNIQUE INDEX "option_package_details_option_package_id_floor_plan_code_se_key" ON "option_package_details"("option_package_id", "floor_plan_code", "series", "elevation_code", "option_code");

-- CreateIndex
CREATE INDEX "idx_option_packages_builder_id" ON "option_packages"("builder_id");

-- CreateIndex
CREATE INDEX "idx_option_packages_community_id" ON "option_packages"("community_id");

-- CreateIndex
CREATE INDEX "idx_option_room_size_changes_builder_id" ON "option_room_size_changes"("builder_id");

-- CreateIndex
CREATE INDEX "idx_option_room_size_changes_codes" ON "option_room_size_changes"("floor_plan_code", "option_code");

-- CreateIndex
CREATE UNIQUE INDEX "option_room_size_changes_region_id_floor_plan_code_option_c_key" ON "option_room_size_changes"("region_id", "floor_plan_code", "option_code", "room", "category_code", "subcategory_code", "unit_of_measure");

-- CreateIndex
CREATE INDEX "idx_option_rules_builder_id" ON "option_rules"("builder_id");

-- CreateIndex
CREATE INDEX "idx_option_rules_option_code" ON "option_rules"("option_code");

-- CreateIndex
CREATE UNIQUE INDEX "option_rules_region_id_community_id_community_phase_id_floo_key" ON "option_rules"("region_id", "community_id", "community_phase_id", "floor_plan_code", "series", "option_code", "related_floor_plan_code", "related_series", "related_option_code");

-- CreateIndex
CREATE INDEX "idx_option_subcategories_builder_id" ON "option_subcategories"("builder_id");

-- CreateIndex
CREATE INDEX "idx_option_subcategories_codes" ON "option_subcategories"("option_category_code", "option_subcategory_code");

-- CreateIndex
CREATE UNIQUE INDEX "option_subcategories_region_id_option_category_code_option__key" ON "option_subcategories"("region_id", "option_category_code", "option_subcategory_code");

-- CreateIndex
CREATE INDEX "idx_option_builder_id" ON "options"("builder_id");

-- CreateIndex
CREATE INDEX "idx_options_codes" ON "options"("floor_plan_code", "option_code");

-- CreateIndex
CREATE INDEX "idx_options_community_id" ON "options"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "options_region_id_community_id_community_phase_id_floor_pla_key" ON "options"("region_id", "community_id", "community_phase_id", "floor_plan_code", "elevation_code", "option_code", "series");

-- CreateIndex
CREATE INDEX "idx_po_correspondence_builder_id" ON "po_correspondence"("builder_id");

-- CreateIndex
CREATE INDEX "idx_po_correspondence_builder_supplier_id" ON "po_correspondence"("builder_supplier_id");

-- CreateIndex
CREATE INDEX "idx_po_correspondence_po_master_id" ON "po_correspondence"("po_master_id");

-- CreateIndex
CREATE UNIQUE INDEX "po_correspondence_po_master_id_sequence_key" ON "po_correspondence"("po_master_id", "sequence");

-- CreateIndex
CREATE INDEX "idx_po_group_builder_id" ON "po_group"("builder_id");

-- CreateIndex
CREATE INDEX "idx_po_group_po_group" ON "po_group"("po_group");

-- CreateIndex
CREATE INDEX "idx_po_group_region_id" ON "po_group"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "po_group_region_id_po_group_key" ON "po_group"("region_id", "po_group");

-- CreateIndex
CREATE UNIQUE INDEX "po_items_po_item_seq_key" ON "po_items"("po_item_seq");

-- CreateIndex
CREATE INDEX "idx_po_items_builder_id" ON "po_items"("builder_id");

-- CreateIndex
CREATE INDEX "idx_po_items_job_number" ON "po_items"("job_number");

-- CreateIndex
CREATE INDEX "idx_po_items_po_index" ON "po_items"("po_index");

-- CreateIndex
CREATE INDEX "idx_po_items_po_master_id" ON "po_items"("po_master_id");

-- CreateIndex
CREATE INDEX "idx_po_items_po_number" ON "po_items"("po_number");

-- CreateIndex
CREATE INDEX "idx_po_items_region_id" ON "po_items"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "po_items_co_po_item_co_seq_key" ON "po_items_co"("po_item_co_seq");

-- CreateIndex
CREATE INDEX "idx_po_items_co_builder_id" ON "po_items_co"("builder_id");

-- CreateIndex
CREATE INDEX "idx_po_items_co_po_index" ON "po_items_co"("po_index");

-- CreateIndex
CREATE INDEX "idx_po_items_co_po_items_id" ON "po_items_co"("po_items_id");

-- CreateIndex
CREATE INDEX "idx_po_items_co_po_master_co_id" ON "po_items_co"("po_master_co_id");

-- CreateIndex
CREATE INDEX "idx_po_master_builder_id" ON "po_master"("builder_id");

-- CreateIndex
CREATE INDEX "idx_po_master_job_unit" ON "po_master"("job_number", "unit_number");

-- CreateIndex
CREATE INDEX "idx_po_master_po_number" ON "po_master"("po_number");

-- CreateIndex
CREATE INDEX "idx_po_master_co_builder_id" ON "po_master_co"("builder_id");

-- CreateIndex
CREATE INDEX "idx_po_master_co_po_master_id" ON "po_master_co"("po_master_id");

-- CreateIndex
CREATE INDEX "idx_po_sequential_numbers_builder_id" ON "po_sequential_numbers"("builder_id");

-- CreateIndex
CREATE INDEX "idx_po_viewing_history_builder_id" ON "po_viewing_history"("builder_id");

-- CreateIndex
CREATE INDEX "idx_po_viewing_history_date_viewed" ON "po_viewing_history"("date_viewed");

-- CreateIndex
CREATE INDEX "idx_po_viewing_history_po_master_id" ON "po_viewing_history"("po_master_id");

-- CreateIndex
CREATE INDEX "idx_posting_batches_batch_date" ON "posting_batches"("batch_date");

-- CreateIndex
CREATE INDEX "idx_posting_batches_batch_type" ON "posting_batches"("batch_type");

-- CreateIndex
CREATE INDEX "idx_posting_batches_builder_id" ON "posting_batches"("builder_id");

-- CreateIndex
CREATE INDEX "idx_posting_batches_region_id" ON "posting_batches"("region_id");

-- CreateIndex
CREATE INDEX "idx_quote_contract_co_master_builder_id" ON "quote_contract_co_master"("builder_id");

-- CreateIndex
CREATE INDEX "idx_quote_contract_co_master_quote_contract_id" ON "quote_contract_co_master"("quote_contract_id");

-- CreateIndex
CREATE INDEX "idx_quote_contract_deposits_builder_id" ON "quote_contract_deposits"("builder_id");

-- CreateIndex
CREATE INDEX "idx_quote_contract_deposits_contract_id" ON "quote_contract_deposits"("quote_contract_id");

-- CreateIndex
CREATE INDEX "idx_quote_contract_deposits_status" ON "quote_contract_deposits"("deposit_status");

-- CreateIndex
CREATE INDEX "idx_quote_contract_room_sizes_builder_id" ON "quote_contract_room_sizes"("builder_id");

-- CreateIndex
CREATE INDEX "idx_quote_contract_room_sizes_contract_id" ON "quote_contract_room_sizes"("quote_contract_id");

-- CreateIndex
CREATE INDEX "idx_quote_contracts_builder_id" ON "quote_contracts"("builder_id");

-- CreateIndex
CREATE INDEX "idx_quote_contracts_contract_number" ON "quote_contracts"("contract_number");

-- CreateIndex
CREATE INDEX "idx_quote_contracts_opportunity_id" ON "quote_contracts"("opportunity_id");

-- CreateIndex
CREATE INDEX "idx_quote_contracts_allowances_builder_id" ON "quote_contracts_allowances"("builder_id");

-- CreateIndex
CREATE INDEX "idx_quote_contracts_allowances_category" ON "quote_contracts_allowances"("allowance_category");

-- CreateIndex
CREATE INDEX "idx_quote_contracts_allowances_contract_id" ON "quote_contracts_allowances"("quote_contract_id");

-- CreateIndex
CREATE INDEX "idx_quote_contracts_custom_fields_builder_id" ON "quote_contracts_custom_fields"("builder_id");

-- CreateIndex
CREATE INDEX "idx_quote_contracts_custom_fields_category" ON "quote_contracts_custom_fields"("field_category");

-- CreateIndex
CREATE INDEX "idx_quote_contracts_custom_fields_contract_id" ON "quote_contracts_custom_fields"("quote_contract_id");

-- CreateIndex
CREATE INDEX "idx_room_master_builder_id" ON "room_master"("builder_id");

-- CreateIndex
CREATE INDEX "idx_room_master_inactive" ON "room_master"("inactive");

-- CreateIndex
CREATE INDEX "idx_room_master_region_id" ON "room_master"("region_id");

-- CreateIndex
CREATE INDEX "idx_room_master_room_location" ON "room_master"("room_location");

-- CreateIndex
CREATE UNIQUE INDEX "room_master_builder_id_region_id_room_location_key" ON "room_master"("builder_id", "region_id", "room_location");

-- CreateIndex
CREATE INDEX "idx_room_subcategories_builder_id" ON "room_subcategories"("builder_id");

-- CreateIndex
CREATE INDEX "idx_room_subcategories_category" ON "room_subcategories"("category_code", "subcategory_code");

-- CreateIndex
CREATE INDEX "idx_room_subcategories_region_id" ON "room_subcategories"("region_id");

-- CreateIndex
CREATE INDEX "idx_room_subcategories_room_location" ON "room_subcategories"("room_location");

-- CreateIndex
CREATE UNIQUE INDEX "room_subcategories_builder_id_region_id_room_location_categ_key" ON "room_subcategories"("builder_id", "region_id", "room_location", "category_code", "subcategory_code", "unit_of_measure");

-- CreateIndex
CREATE INDEX "idx_sage_intacct_departments_builder_id" ON "sage_intacct_departments"("builder_id");

-- CreateIndex
CREATE UNIQUE INDEX "sage_intacct_departments_builder_id_department_id_key" ON "sage_intacct_departments"("builder_id", "department_id");

-- CreateIndex
CREATE INDEX "idx_sage_intacct_entities_builder_id" ON "sage_intacct_entities"("builder_id");

-- CreateIndex
CREATE UNIQUE INDEX "sage_intacct_entities_builder_id_entity_id_key" ON "sage_intacct_entities"("builder_id", "entity_id");

-- CreateIndex
CREATE INDEX "idx_sage_intacct_locations_builder_id" ON "sage_intacct_locations"("builder_id");

-- CreateIndex
CREATE UNIQUE INDEX "sage_intacct_locations_builder_id_location_id_key" ON "sage_intacct_locations"("builder_id", "location_id");

-- CreateIndex
CREATE INDEX "idx_sales_price_sheet_details_builder_id" ON "sales_price_sheet_details"("builder_id");

-- CreateIndex
CREATE INDEX "idx_sales_price_sheet_details_item_type" ON "sales_price_sheet_details"("item_type");

-- CreateIndex
CREATE INDEX "idx_sales_price_sheet_details_master_id" ON "sales_price_sheet_details"("sales_price_sheet_master_id");

-- CreateIndex
CREATE INDEX "idx_sales_price_sheet_master_builder_id" ON "sales_price_sheet_master"("builder_id");

-- CreateIndex
CREATE INDEX "idx_sales_price_sheet_master_community_id" ON "sales_price_sheet_master"("community_id");

-- CreateIndex
CREATE INDEX "idx_sales_price_sheet_master_region_id" ON "sales_price_sheet_master"("region_id");

-- CreateIndex
CREATE INDEX "idx_schedule_master_qc_items_builder_id" ON "schedule_master_qc_items"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_master_qc_items_qc_section_id" ON "schedule_master_qc_items"("qc_section_id");

-- CreateIndex
CREATE INDEX "idx_schedule_master_qc_lists_builder_id" ON "schedule_master_qc_lists"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_master_qc_sections_builder_id" ON "schedule_master_qc_sections"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_master_qc_sections_qc_list_id" ON "schedule_master_qc_sections"("qc_list_id");

-- CreateIndex
CREATE INDEX "idx_schedule_master_task_list_builder_id" ON "schedule_master_task_list"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_master_task_list_parent_id" ON "schedule_master_task_list"("parent_id");

-- CreateIndex
CREATE INDEX "idx_schedule_master_task_list_region_id" ON "schedule_master_task_list"("region_id");

-- CreateIndex
CREATE INDEX "idx_schedule_qc_sections_builder_id" ON "schedule_qc_sections"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_qc_sections_schedule_task_id" ON "schedule_qc_sections"("schedule_task_id");

-- CreateIndex
CREATE INDEX "idx_schedule_task_activity_log_builder_id" ON "schedule_task_activity_log"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_task_activity_log_po_number" ON "schedule_task_activity_log"("po_number");

-- CreateIndex
CREATE INDEX "idx_schedule_task_activity_log_schedule_task_id" ON "schedule_task_activity_log"("schedule_task_id");

-- CreateIndex
CREATE INDEX "idx_schedule_task_constraints_builder_id" ON "schedule_task_constraints"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_task_constraints_predecessor_task_id" ON "schedule_task_constraints"("predecessor_task_id");

-- CreateIndex
CREATE INDEX "idx_schedule_task_constraints_schedule_task_id" ON "schedule_task_constraints"("schedule_task_id");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_task_constraints_constraint_type_schedule_task_id__key" ON "schedule_task_constraints"("constraint_type", "schedule_task_id", "predecessor_task_id");

-- CreateIndex
CREATE INDEX "idx_schedule_task_history_log_builder_id" ON "schedule_task_history_log"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_task_history_log_log_date" ON "schedule_task_history_log"("log_date");

-- CreateIndex
CREATE INDEX "idx_schedule_task_history_log_schedule_task_id" ON "schedule_task_history_log"("schedule_task_id");

-- CreateIndex
CREATE INDEX "idx_schedule_task_notifications_builder_id" ON "schedule_task_notifications"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_task_notifications_delivery_date" ON "schedule_task_notifications"("delivery_date");

-- CreateIndex
CREATE INDEX "idx_schedule_task_notifications_schedule_task_id" ON "schedule_task_notifications"("schedule_task_id");

-- CreateIndex
CREATE INDEX "idx_schedule_task_qc_items_builder_id" ON "schedule_task_qc_items"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_task_qc_items_qc_section_id" ON "schedule_task_qc_items"("qc_section_id");

-- CreateIndex
CREATE INDEX "idx_schedule_task_qc_items_schedule_task_id" ON "schedule_task_qc_items"("schedule_task_id");

-- CreateIndex
CREATE INDEX "idx_schedule_tasks_builder_id" ON "schedule_tasks"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_tasks_current_supplier_id" ON "schedule_tasks"("current_supplier_id");

-- CreateIndex
CREATE INDEX "idx_schedule_tasks_job_number" ON "schedule_tasks"("job_number");

-- CreateIndex
CREATE INDEX "idx_schedule_tasks_original_supplier_id" ON "schedule_tasks"("original_supplier_id");

-- CreateIndex
CREATE INDEX "idx_schedule_tasks_parent_task_id" ON "schedule_tasks"("parent_task_id");

-- CreateIndex
CREATE INDEX "idx_schedule_tasks_schedule_id" ON "schedule_tasks"("schedule_id");

-- CreateIndex
CREATE INDEX "idx_schedule_template_non_work_days_builder_id" ON "schedule_template_non_work_days"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_template_non_work_days_template_id" ON "schedule_template_non_work_days"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_template_non_work_days_template_id_working_days_key" ON "schedule_template_non_work_days"("template_id", "working_days");

-- CreateIndex
CREATE INDEX "idx_schedule_template_task_constraints_builder_id" ON "schedule_template_task_constraints"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_template_task_constraints_task_id" ON "schedule_template_task_constraints"("task_id");

-- CreateIndex
CREATE INDEX "idx_schedule_template_task_constraints_template_id" ON "schedule_template_task_constraints"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_template_task_constr_template_id_task_id_predecess_key" ON "schedule_template_task_constraints"("template_id", "task_id", "predecessor_task_id");

-- CreateIndex
CREATE INDEX "idx_schedule_template_tasks_builder_id" ON "schedule_template_tasks"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_template_tasks_parent_id" ON "schedule_template_tasks"("parent_id");

-- CreateIndex
CREATE INDEX "idx_schedule_template_tasks_template_id" ON "schedule_template_tasks"("template_id");

-- CreateIndex
CREATE INDEX "idx_schedule_templates_builder_id" ON "schedule_templates"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedule_templates_region_id" ON "schedule_templates"("region_id");

-- CreateIndex
CREATE INDEX "idx_schedules_builder_id" ON "schedules"("builder_id");

-- CreateIndex
CREATE INDEX "idx_schedules_job_number" ON "schedules"("job_number");

-- CreateIndex
CREATE INDEX "idx_schedules_region_id" ON "schedules"("region_id");

-- CreateIndex
CREATE INDEX "idx_schedules_template_id" ON "schedules"("template_id");

-- CreateIndex
CREATE INDEX "idx_scheduling_non_working_days_builder_id" ON "scheduling_non_working_days"("builder_id");

-- CreateIndex
CREATE INDEX "idx_scheduling_non_working_days_non_working_date" ON "scheduling_non_working_days"("non_working_date");

-- CreateIndex
CREATE INDEX "idx_scheduling_non_working_days_region_id" ON "scheduling_non_working_days"("region_id");

-- CreateIndex
CREATE INDEX "idx_scheduling_working_days_builder_id" ON "scheduling_working_days"("builder_id");

-- CreateIndex
CREATE INDEX "idx_scheduling_working_days_region_id" ON "scheduling_working_days"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "scheduling_working_days_region_id_day_of_week_key" ON "scheduling_working_days"("region_id", "day_of_week");

-- CreateIndex
CREATE INDEX "idx_default_suppliers_builder_id" ON "default_suppliers"("builder_id");

-- CreateIndex
CREATE INDEX "idx_default_suppliers_community_id" ON "default_suppliers"("community_id");

-- CreateIndex
CREATE UNIQUE INDEX "default_suppliers_region_id_community_id_community_phase_co_key" ON "default_suppliers"("region_id", "community_id", "community_phase_code", "floor_plan_code", "po_index");

-- CreateIndex
CREATE INDEX "idx_digital_signature_roles_builder_id" ON "digital_signature_roles"("builder_id");

-- CreateIndex
CREATE UNIQUE INDEX "digital_signature_roles_builder_id_role_name_key" ON "digital_signature_roles"("builder_id", "role_name");

-- CreateIndex
CREATE INDEX "idx_divisions_builder_id" ON "divisions"("builder_id");

-- CreateIndex
CREATE INDEX "idx_divisions_division_code" ON "divisions"("division_code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_division_code_per_builder" ON "divisions"("builder_id", "division_code");

-- CreateIndex
CREATE INDEX "idx_insurance_types_builder_id" ON "insurance_types"("builder_id");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_types_builder_id_insurance_type_key" ON "insurance_types"("builder_id", "insurance_type");

-- CreateIndex
CREATE INDEX "idx_real_estate_brokers_builder_id" ON "real_estate_brokers"("builder_id");

-- CreateIndex
CREATE INDEX "idx_real_estate_brokers_license" ON "real_estate_brokers"("license_number");

-- CreateIndex
CREATE INDEX "idx_realtors_broker_id" ON "realtors"("real_estate_broker_id");

-- CreateIndex
CREATE INDEX "idx_realtors_builder_id" ON "realtors"("builder_id");

-- CreateIndex
CREATE INDEX "idx_realtors_license" ON "realtors"("license_number");

-- CreateIndex
CREATE INDEX "idx_region_division_id" ON "regions"("division_id");

-- CreateIndex
CREATE INDEX "idx_regions_builder_id" ON "regions"("builder_id");

-- CreateIndex
CREATE INDEX "idx_regions_division_id" ON "regions"("division_id");

-- CreateIndex
CREATE UNIQUE INDEX "region_builder_division_region_unique" ON "regions"("builder_id", "division_id", "region_code");

-- CreateIndex
CREATE UNIQUE INDEX "regions_builder_id_region_code_key" ON "regions"("builder_id", "region_code");

-- CreateIndex
CREATE INDEX "idx_shopping_cart_selection_response_builder_id" ON "shopping_cart_selection_sheet_response"("builder_id");

-- CreateIndex
CREATE INDEX "idx_shopping_cart_selection_response_cart_id" ON "shopping_cart_selection_sheet_response"("customer_shopping_cart_id");

-- CreateIndex
CREATE INDEX "idx_system_user_audit_created_at" ON "system_user_audit"("created_at");

-- CreateIndex
CREATE INDEX "idx_system_user_audit_user_id" ON "system_user_audit"("user_id");

-- CreateIndex
CREATE INDEX "idx_tax_groups_builder_id" ON "tax_groups"("builder_id");

-- CreateIndex
CREATE INDEX "idx_tax_groups_community_id" ON "tax_groups"("community_id");

-- CreateIndex
CREATE INDEX "idx_tax_groups_region_id" ON "tax_groups"("region_id");

-- CreateIndex
CREATE UNIQUE INDEX "tax_groups_region_id_community_id_tax_group_key" ON "tax_groups"("region_id", "community_id", "tax_group");

-- CreateIndex
CREATE INDEX "idx_variance_po_builder_id" ON "variance_po"("builder_id");

-- CreateIndex
CREATE INDEX "idx_variance_po_po_master_id" ON "variance_po"("po_master_id");

-- CreateIndex
CREATE INDEX "idx_variance_po_po_number" ON "variance_po"("po_number");

-- CreateIndex
CREATE INDEX "idx_variance_po_region_id" ON "variance_po"("region_id");

-- CreateIndex
CREATE INDEX "idx_variance_po_schedule_id" ON "variance_po"("schedule_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_master_builder_id" ON "selection_sheet_master"("builder_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_master_community_id" ON "selection_sheet_master"("community_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_master_region_id" ON "selection_sheet_master"("region_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_page_builder_id" ON "selection_sheet_page"("builder_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_page_master_id" ON "selection_sheet_page"("selection_sheet_master_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_question_builder_id" ON "selection_sheet_question"("builder_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_question_code" ON "selection_sheet_question"("question_code");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_question_section_id" ON "selection_sheet_question"("selection_sheet_section_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_response_builder_id" ON "selection_sheet_response"("builder_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_response_question_id" ON "selection_sheet_response"("selection_sheet_question_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_response_related_entity" ON "selection_sheet_response"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_section_builder_id" ON "selection_sheet_section"("builder_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_section_page_id" ON "selection_sheet_section"("selection_sheet_page_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_sub_question1_builder_id" ON "selection_sheet_sub_question1"("builder_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_sub_question1_question_id" ON "selection_sheet_sub_question1"("selection_sheet_question_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_sub_question2_builder_id" ON "selection_sheet_sub_question2"("builder_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_sub_question2_sub_question1_id" ON "selection_sheet_sub_question2"("selection_sheet_sub_question1_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_sub_response1_builder_id" ON "selection_sheet_sub_response1"("builder_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_sub_response1_response_id" ON "selection_sheet_sub_response1"("selection_sheet_response_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_sub_response1_sub_question1_id" ON "selection_sheet_sub_response1"("selection_sheet_sub_question1_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_sub_response2_builder_id" ON "selection_sheet_sub_response2"("builder_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_sub_response2_sub_question2_id" ON "selection_sheet_sub_response2"("selection_sheet_sub_question2_id");

-- CreateIndex
CREATE INDEX "idx_selection_sheet_sub_response2_sub_response1_id" ON "selection_sheet_sub_response2"("selection_sheet_sub_response1_id");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_assignments_assignment_status" ON "supplier_bid_assignments"("assignment_status");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_assignments_builder_id" ON "supplier_bid_assignments"("builder_id");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_assignments_builder_supplier_id" ON "supplier_bid_assignments"("builder_supplier_id");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_assignments_supplier_bid_guid" ON "supplier_bid_assignments"("supplier_bid_guid");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_attachments_assignment_guid" ON "supplier_bid_attachments"("supplier_bid_assignment_guid");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_attachments_bid_guid" ON "supplier_bid_attachments"("supplier_bid_guid");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_attachments_builder_id" ON "supplier_bid_attachments"("builder_id");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_attachments_pricing_guid" ON "supplier_bid_attachments"("supplier_bid_pricing_guid");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_master_bid_number" ON "supplier_bid_master"("bid_number");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_master_bid_status" ON "supplier_bid_master"("bid_status");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_master_builder_id" ON "supplier_bid_master"("builder_id");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_master_community_id" ON "supplier_bid_master"("community_id");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_master_region_id" ON "supplier_bid_master"("region_id");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_pricing_assembly_id" ON "supplier_bid_pricing"("assembly_id");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_pricing_assignment_guid" ON "supplier_bid_pricing"("supplier_bid_assignment_guid");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_pricing_builder_id" ON "supplier_bid_pricing"("builder_id");

-- CreateIndex
CREATE INDEX "idx_supplier_bid_pricing_estimating_db_item_id" ON "supplier_bid_pricing"("estimating_db_item_id");

-- CreateIndex
CREATE INDEX "idx_supplier_contacts_builder_id" ON "supplier_contacts"("builder_id");

-- CreateIndex
CREATE INDEX "idx_supplier_contacts_email" ON "supplier_contacts"("email");

-- CreateIndex
CREATE INDEX "idx_supplier_contacts_is_inactive" ON "supplier_contacts"("is_inactive");

-- CreateIndex
CREATE INDEX "idx_supplier_contacts_supplier_id" ON "supplier_contacts"("supplier_id");

-- CreateIndex
CREATE INDEX "idx_supplier_costs_builder_id" ON "supplier_costs"("builder_id");

-- CreateIndex
CREATE INDEX "idx_supplier_costs_community_id" ON "supplier_costs"("community_id");

-- CreateIndex
CREATE INDEX "idx_supplier_costs_effective_date" ON "supplier_costs"("effective_date");

-- CreateIndex
CREATE INDEX "idx_supplier_costs_estimating_db_item_id" ON "supplier_costs"("estimating_db_item_id");

-- CreateIndex
CREATE INDEX "idx_supplier_costs_region_id" ON "supplier_costs"("region_id");

-- CreateIndex
CREATE INDEX "idx_supplier_costs_supplier_id" ON "supplier_costs"("builder_supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_supplier_costs" ON "supplier_costs"("builder_id", "builder_supplier_id", "region_id", "community_id", "community_phase_code", "floor_plan_code", "elevation_code", "option_code", "version_number", "estimating_db_item_id");

-- CreateIndex
CREATE INDEX "idx_supplier_insurance_builder_id" ON "supplier_insurance"("builder_id");

-- CreateIndex
CREATE INDEX "idx_supplier_insurance_insurance_type_id" ON "supplier_insurance"("insurance_type_id");

-- CreateIndex
CREATE INDEX "idx_supplier_insurance_policy_end_date" ON "supplier_insurance"("policy_end_date");

-- CreateIndex
CREATE INDEX "idx_supplier_insurance_region_id" ON "supplier_insurance"("region_id");

-- CreateIndex
CREATE INDEX "idx_supplier_insurance_supplier_id" ON "supplier_insurance"("builders_supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_supplier_insurance" ON "supplier_insurance"("builder_id", "builders_supplier_id", "insurance_type_id", "region_id");

-- CreateIndex
CREATE INDEX "idx_supplier_po_group_builder_id" ON "supplier_po_group"("builder_id");

-- CreateIndex
CREATE INDEX "idx_supplier_po_group_po_group" ON "supplier_po_group"("po_group");

-- CreateIndex
CREATE INDEX "idx_supplier_po_group_region_id" ON "supplier_po_group"("region_id");

-- CreateIndex
CREATE INDEX "idx_supplier_po_group_supplier_id" ON "supplier_po_group"("builder_supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_supplier_po_group" ON "supplier_po_group"("builder_id", "builder_supplier_id", "region_id", "po_group");

-- CreateIndex
CREATE INDEX "idx_supplier_tax_groups_builder_id" ON "supplier_tax_groups"("builder_id");

-- CreateIndex
CREATE INDEX "idx_supplier_tax_groups_community_id" ON "supplier_tax_groups"("community_id");

-- CreateIndex
CREATE INDEX "idx_supplier_tax_groups_supplier_id" ON "supplier_tax_groups"("builders_supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_supplier_tax_groups" ON "supplier_tax_groups"("builder_id", "builders_supplier_id", "community_id");

-- CreateIndex
CREATE INDEX "idx_supplier_builder_id" ON "suppliers"("builder_id");

-- CreateIndex
CREATE INDEX "idx_supplier_is_inactive" ON "suppliers"("is_inactive");

-- CreateIndex
CREATE INDEX "idx_supplier_supplier_code" ON "suppliers"("supplier_code");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_builder_id_supplier_code_key" ON "suppliers"("builder_id", "supplier_code");

-- CreateIndex
CREATE INDEX "idx_ticket_attachments_builder_id" ON "ticket_attachments"("builder_id");

-- CreateIndex
CREATE INDEX "idx_ticket_attachments_ticket_id" ON "ticket_attachments"("ticket_id");

-- CreateIndex
CREATE INDEX "idx_ticket_categories_builder_id" ON "ticket_categories"("builder_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_categories_builder_id_category_name_key" ON "ticket_categories"("builder_id", "category_name");

-- CreateIndex
CREATE INDEX "idx_ticket_comments_builder_id" ON "ticket_comments"("builder_id");

-- CreateIndex
CREATE INDEX "idx_ticket_comments_created_at" ON "ticket_comments"("created_at");

-- CreateIndex
CREATE INDEX "idx_ticket_comments_ticket_id" ON "ticket_comments"("ticket_id");

-- CreateIndex
CREATE INDEX "idx_ticket_comments_user_id" ON "ticket_comments"("user_id");

-- CreateIndex
CREATE INDEX "idx_ticket_history_builder_id" ON "ticket_history"("builder_id");

-- CreateIndex
CREATE INDEX "idx_ticket_history_created_at" ON "ticket_history"("created_at");

-- CreateIndex
CREATE INDEX "idx_ticket_history_ticket_id" ON "ticket_history"("ticket_id");

-- CreateIndex
CREATE INDEX "idx_ticket_priorities_builder_id" ON "ticket_priorities"("builder_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_priorities_builder_id_priority_level_key" ON "ticket_priorities"("builder_id", "priority_level");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_priorities_builder_id_priority_name_key" ON "ticket_priorities"("builder_id", "priority_name");

-- CreateIndex
CREATE INDEX "idx_ticket_statuses_builder_id" ON "ticket_statuses"("builder_id");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_statuses_builder_id_status_name_key" ON "ticket_statuses"("builder_id", "status_name");

-- CreateIndex
CREATE INDEX "idx_tickets_assigned_to" ON "tickets"("assigned_to");

-- CreateIndex
CREATE INDEX "idx_tickets_builder_id" ON "tickets"("builder_id");

-- CreateIndex
CREATE INDEX "idx_tickets_category_id" ON "tickets"("category_id");

-- CreateIndex
CREATE INDEX "idx_tickets_priority_id" ON "tickets"("priority_id");

-- CreateIndex
CREATE INDEX "idx_tickets_reported_by" ON "tickets"("reported_by");

-- CreateIndex
CREATE INDEX "idx_tickets_reported_date" ON "tickets"("reported_date");

-- CreateIndex
CREATE INDEX "idx_tickets_status_id" ON "tickets"("status_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_builder_id_ticket_number_key" ON "tickets"("builder_id", "ticket_number");

-- CreateIndex
CREATE INDEX "idx_user_communities_builder_id" ON "user_communities"("builder_id");

-- CreateIndex
CREATE INDEX "idx_user_communities_community_id" ON "user_communities"("community_id");

-- CreateIndex
CREATE INDEX "idx_user_communities_user_id" ON "user_communities"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_default_regions_builder_id" ON "user_default_regions"("builder_id");

-- CreateIndex
CREATE INDEX "idx_user_default_regions_region_id" ON "user_default_regions"("region_id");

-- CreateIndex
CREATE INDEX "idx_user_default_regions_user_id" ON "user_default_regions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_default_regions_builder_id_user_id_key" ON "user_default_regions"("builder_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_user_divisions_builder_id" ON "user_divisions"("builder_id");

-- CreateIndex
CREATE INDEX "idx_user_divisions_division_id" ON "user_divisions"("division_id");

-- CreateIndex
CREATE INDEX "idx_user_divisions_user_id" ON "user_divisions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_divisions_user_id_division_id_key" ON "user_divisions"("user_id", "division_id");

-- CreateIndex
CREATE INDEX "idx_user_groups_builder_id" ON "user_groups"("builder_id");

-- CreateIndex
CREATE INDEX "idx_user_groups_group_id" ON "user_groups"("auth_group_id");

-- CreateIndex
CREATE INDEX "idx_user_groups_user_id" ON "user_groups"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_groups_user_id_auth_group_id_key" ON "user_groups"("user_id", "auth_group_id");

-- CreateIndex
CREATE INDEX "idx_user_permissions_builder_id" ON "user_permissions"("builder_id");

-- CreateIndex
CREATE INDEX "idx_user_permissions_permission_id" ON "user_permissions"("auth_permission_id");

-- CreateIndex
CREATE INDEX "idx_user_permissions_user_id" ON "user_permissions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_user_id_auth_permission_id_key" ON "user_permissions"("user_id", "auth_permission_id");

-- CreateIndex
CREATE INDEX "idx_user_profiles_builder_id" ON "user_profiles"("builder_id");

-- CreateIndex
CREATE INDEX "idx_user_profiles_role_id" ON "user_profiles"("role_id");

-- CreateIndex
CREATE INDEX "idx_user_profiles_user_id" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_builder_id_user_id_key" ON "user_profiles"("builder_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_user_regions_builder_id" ON "user_regions"("builder_id");

-- CreateIndex
CREATE INDEX "idx_user_regions_region_id" ON "user_regions"("region_id");

-- CreateIndex
CREATE INDEX "idx_user_regions_user_id" ON "user_regions"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_role_assignments_builder_id" ON "user_role_assignments"("builder_id");

-- CreateIndex
CREATE INDEX "idx_user_role_assignments_role_id" ON "user_role_assignments"("role_id");

-- CreateIndex
CREATE INDEX "idx_user_role_assignments_user_id" ON "user_role_assignments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_token_key" ON "user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "idx_user_sessions_active" ON "user_sessions"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "idx_user_sessions_token" ON "user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "idx_user_sessions_user_id" ON "user_sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_user_login_id_key" ON "users"("user_login_id");

-- CreateIndex
CREATE INDEX "idx_user_builder_id" ON "users"("builder_id");

-- CreateIndex
CREATE INDEX "idx_user_login" ON "users"("user_login_id");

-- CreateIndex
CREATE INDEX "idx_warranty_problem_po_indexes_builder_id" ON "warranty_problem_po_indexes"("builder_id");

-- CreateIndex
CREATE INDEX "idx_warranty_problem_po_indexes_po_master_id" ON "warranty_problem_po_indexes"("po_master_id");

-- CreateIndex
CREATE INDEX "idx_warranty_problem_po_indexes_problem_id" ON "warranty_problem_po_indexes"("warranty_problem_id");

-- CreateIndex
CREATE INDEX "idx_warranty_problems_assigned_to" ON "warranty_problems"("assigned_to");

-- CreateIndex
CREATE INDEX "idx_warranty_problems_builder_id" ON "warranty_problems"("builder_id");

-- CreateIndex
CREATE INDEX "idx_warranty_problems_community_id" ON "warranty_problems"("community_id");

-- CreateIndex
CREATE INDEX "idx_warranty_problems_customer_id" ON "warranty_problems"("customer_id");

-- CreateIndex
CREATE INDEX "idx_warranty_problems_home_id" ON "warranty_problems"("home_id");

-- CreateIndex
CREATE INDEX "idx_warranty_problems_job_id" ON "warranty_problems"("job_id");

-- CreateIndex
CREATE INDEX "idx_warranty_problems_region_id" ON "warranty_problems"("region_id");

-- CreateIndex
CREATE INDEX "idx_warranty_problems_status" ON "warranty_problems"("status");

-- CreateIndex
CREATE INDEX "idx_warranty_problems_supplier_id" ON "warranty_problems"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "warranty_problems_builder_id_problem_number_key" ON "warranty_problems"("builder_id", "problem_number");

-- CreateIndex
CREATE INDEX "idx_warranty_work_orders_builder_id" ON "warranty_work_orders"("builder_id");

-- CreateIndex
CREATE INDEX "idx_warranty_work_orders_problem_id" ON "warranty_work_orders"("warranty_problem_id");

-- CreateIndex
CREATE INDEX "idx_warranty_work_orders_status" ON "warranty_work_orders"("status");

-- CreateIndex
CREATE INDEX "idx_warranty_work_orders_supplier_id" ON "warranty_work_orders"("assigned_supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "warranty_work_orders_builder_id_work_order_number_key" ON "warranty_work_orders"("builder_id", "work_order_number");

-- AddForeignKey
ALTER TABLE "accounting_ap_payments" ADD CONSTRAINT "accounting_ap_payments_ap_invoice_id_fkey" FOREIGN KEY ("ap_invoice_id") REFERENCES "ap_invoices"("ap_invoice_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_ap_payments" ADD CONSTRAINT "accounting_ap_payments_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_ap_payments" ADD CONSTRAINT "accounting_ap_payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_ap_payments" ADD CONSTRAINT "accounting_ap_payments_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_databases" ADD CONSTRAINT "accounting_databases_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_databases" ADD CONSTRAINT "accounting_databases_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_databases" ADD CONSTRAINT "accounting_databases_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_gl_accounts" ADD CONSTRAINT "accounting_gl_accounts_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_gl_accounts" ADD CONSTRAINT "accounting_gl_accounts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_gl_accounts" ADD CONSTRAINT "accounting_gl_accounts_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_systems" ADD CONSTRAINT "accounting_systems_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_systems" ADD CONSTRAINT "accounting_systems_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "accounting_systems" ADD CONSTRAINT "accounting_systems_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_components" ADD CONSTRAINT "assembly_components_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_components" ADD CONSTRAINT "assembly_components_component_assembly_id_fkey" FOREIGN KEY ("component_assembly_id") REFERENCES "assembly_master"("assembly_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_components" ADD CONSTRAINT "assembly_components_parent_assembly_id_fkey" FOREIGN KEY ("parent_assembly_id") REFERENCES "assembly_master"("assembly_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_intersect_assemblies" ADD CONSTRAINT "assembly_intersect_assemblies_assembly_id_fkey" FOREIGN KEY ("assembly_id") REFERENCES "assembly_master"("assembly_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_intersect_assemblies" ADD CONSTRAINT "assembly_intersect_assemblies_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_intersect_assemblies" ADD CONSTRAINT "assembly_intersect_assemblies_intersect_id_fkey" FOREIGN KEY ("intersect_id") REFERENCES "assembly_intersections"("intersect_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_intersect_items" ADD CONSTRAINT "assembly_intersect_items_assembly_id_fkey" FOREIGN KEY ("assembly_id") REFERENCES "assembly_master"("assembly_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_intersect_items" ADD CONSTRAINT "assembly_intersect_items_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_intersect_items" ADD CONSTRAINT "assembly_intersect_items_estimating_db_item_id_fkey" FOREIGN KEY ("estimating_db_item_id") REFERENCES "estimating_db_items"("estimating_db_item_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_intersect_items" ADD CONSTRAINT "assembly_intersect_items_intersect_id_fkey" FOREIGN KEY ("intersect_id") REFERENCES "assembly_intersections"("intersect_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_intersections" ADD CONSTRAINT "assembly_intersections_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_intersections" ADD CONSTRAINT "assembly_intersections_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_items" ADD CONSTRAINT "assembly_items_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_items" ADD CONSTRAINT "assembly_items_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_master" ADD CONSTRAINT "assembly_master_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_master" ADD CONSTRAINT "assembly_master_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_master" ADD CONSTRAINT "assembly_master_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_sales_pricing" ADD CONSTRAINT "assembly_sales_pricing_assembly_id_fkey" FOREIGN KEY ("assembly_id") REFERENCES "assembly_master"("assembly_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_sales_pricing" ADD CONSTRAINT "assembly_sales_pricing_assembly_type_id_fkey" FOREIGN KEY ("assembly_type_id") REFERENCES "assembly_types"("assembly_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_sales_pricing" ADD CONSTRAINT "assembly_sales_pricing_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_sales_pricing" ADD CONSTRAINT "assembly_sales_pricing_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_sales_pricing" ADD CONSTRAINT "assembly_sales_pricing_community_phase_id_fkey" FOREIGN KEY ("community_phase_id") REFERENCES "community_phase"("community_phase_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_sales_pricing" ADD CONSTRAINT "assembly_sales_pricing_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_sales_pricing" ADD CONSTRAINT "assembly_sales_pricing_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_sales_pricing" ADD CONSTRAINT "assembly_sales_pricing_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_sales_pricing" ADD CONSTRAINT "assembly_sales_pricing_option_package_id_fkey" FOREIGN KEY ("option_package_id") REFERENCES "option_packages"("option_package_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assembly_sales_pricing" ADD CONSTRAINT "assembly_sales_pricing_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_auth_group_id_fkey" FOREIGN KEY ("auth_group_id") REFERENCES "auth_groups"("auth_group_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_auth_permission_id_fkey" FOREIGN KEY ("auth_permission_id") REFERENCES "auth_permissions"("auth_permission_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_group_permissions" ADD CONSTRAINT "auth_group_permissions_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_groups" ADD CONSTRAINT "auth_groups_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth_permissions" ADD CONSTRAINT "auth_permissions_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "claim_template_items" ADD CONSTRAINT "claim_template_items_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "claim_template_items" ADD CONSTRAINT "claim_template_items_claim_template_id_fkey" FOREIGN KEY ("claim_template_id") REFERENCES "claim_templates"("claim_template_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "claim_template_items" ADD CONSTRAINT "claim_template_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "claim_template_items" ADD CONSTRAINT "claim_template_items_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "claim_templates" ADD CONSTRAINT "claim_templates_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "claim_templates" ADD CONSTRAINT "claim_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "claim_templates" ADD CONSTRAINT "claim_templates_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "communities" ADD CONSTRAINT "communities_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "communities" ADD CONSTRAINT "communities_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "communities" ADD CONSTRAINT "community_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("division_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "communities_custom_fields" ADD CONSTRAINT "communities_custom_fields_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "communities_custom_fields" ADD CONSTRAINT "communities_custom_fields_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_phase" ADD CONSTRAINT "community_phases_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_phase" ADD CONSTRAINT "community_phases_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_phase" ADD CONSTRAINT "community_phases_estimator_id_fkey" FOREIGN KEY ("estimator_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_phase" ADD CONSTRAINT "community_phases_sales_manager_id_fkey" FOREIGN KEY ("sales_manager_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_phase" ADD CONSTRAINT "community_phases_site_superintendent_id_fkey" FOREIGN KEY ("site_superintendent_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "community_phase" ADD CONSTRAINT "community_phases_warranty_rep_id_fkey" FOREIGN KEY ("warranty_rep_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "construction_stages" ADD CONSTRAINT "construction_stages_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "construction_stages" ADD CONSTRAINT "construction_stages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contact_types" ADD CONSTRAINT "contact_types_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contacts_custom_fields" ADD CONSTRAINT "contacts_custom_fields_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "contacts_custom_fields" ADD CONSTRAINT "contacts_custom_fields_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("contact_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cost_codes" ADD CONSTRAINT "cost_codes_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customer_shopping_cart" ADD CONSTRAINT "customer_shopping_cart_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customer_shopping_cart" ADD CONSTRAINT "customer_shopping_cart_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customer_shopping_cart" ADD CONSTRAINT "customer_shopping_cart_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customer_shopping_cart" ADD CONSTRAINT "customer_shopping_cart_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document_repository" ADD CONSTRAINT "document_repository_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document_repository" ADD CONSTRAINT "document_repository_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document_repository" ADD CONSTRAINT "document_repository_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document_repository" ADD CONSTRAINT "document_repository_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents_and_attachments" ADD CONSTRAINT "documents_and_attachments_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents_and_attachments" ADD CONSTRAINT "documents_and_attachments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents_and_attachments" ADD CONSTRAINT "documents_and_attachments_document_repository_id_fkey" FOREIGN KEY ("document_repository_id") REFERENCES "document_repository"("document_repository_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents_and_attachments" ADD CONSTRAINT "documents_and_attachments_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "documents_and_attachments" ADD CONSTRAINT "documents_and_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_documents" ADD CONSTRAINT "docusign_documents_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_documents" ADD CONSTRAINT "docusign_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_documents" ADD CONSTRAINT "docusign_documents_docusign_envelope_id_fkey" FOREIGN KEY ("docusign_envelope_id") REFERENCES "docusign_envelopes"("docusign_envelope_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_documents" ADD CONSTRAINT "docusign_documents_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_envelope_tabs" ADD CONSTRAINT "docusign_envelope_tabs_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_envelope_tabs" ADD CONSTRAINT "docusign_envelope_tabs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_envelope_tabs" ADD CONSTRAINT "docusign_envelope_tabs_docusign_envelope_id_fkey" FOREIGN KEY ("docusign_envelope_id") REFERENCES "docusign_envelopes"("docusign_envelope_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_envelope_tabs" ADD CONSTRAINT "docusign_envelope_tabs_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_envelopes" ADD CONSTRAINT "docusign_envelopes_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_envelopes" ADD CONSTRAINT "docusign_envelopes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_envelopes" ADD CONSTRAINT "docusign_envelopes_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_oauth2" ADD CONSTRAINT "docusign_oauth2_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_oauth2" ADD CONSTRAINT "docusign_oauth2_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_oauth2" ADD CONSTRAINT "docusign_oauth2_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_recipient_event_log" ADD CONSTRAINT "docusign_recipient_event_log_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_recipient_event_log" ADD CONSTRAINT "docusign_recipient_event_log_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_recipient_event_log" ADD CONSTRAINT "docusign_recipient_event_log_docusign_envelope_id_fkey" FOREIGN KEY ("docusign_envelope_id") REFERENCES "docusign_envelopes"("docusign_envelope_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_recipient_event_log" ADD CONSTRAINT "docusign_recipient_event_log_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_recipient_status" ADD CONSTRAINT "docusign_recipient_status_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_recipient_status" ADD CONSTRAINT "docusign_recipient_status_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_recipient_status" ADD CONSTRAINT "docusign_recipient_status_docusign_envelope_id_fkey" FOREIGN KEY ("docusign_envelope_id") REFERENCES "docusign_envelopes"("docusign_envelope_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_recipient_status" ADD CONSTRAINT "docusign_recipient_status_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_role_tabs" ADD CONSTRAINT "docusign_role_tabs_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_role_tabs" ADD CONSTRAINT "docusign_role_tabs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_role_tabs" ADD CONSTRAINT "docusign_role_tabs_digital_signature_role_id_fkey" FOREIGN KEY ("digital_signature_role_id") REFERENCES "digital_signature_roles"("digital_signature_role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "docusign_role_tabs" ADD CONSTRAINT "docusign_role_tabs_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elevation_images" ADD CONSTRAINT "elevation_images_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elevation_images" ADD CONSTRAINT "elevation_images_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elevation_images" ADD CONSTRAINT "elevation_images_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elevation_room_sizes" ADD CONSTRAINT "elevation_room_sizes_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elevation_room_sizes" ADD CONSTRAINT "elevation_room_sizes_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elevation_room_sizes" ADD CONSTRAINT "elevation_room_sizes_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elevations" ADD CONSTRAINT "elevations_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elevations" ADD CONSTRAINT "elevations_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elevations" ADD CONSTRAINT "elevations_community_phase_id_fkey" FOREIGN KEY ("community_phase_id") REFERENCES "community_phase"("community_phase_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elevations" ADD CONSTRAINT "elevations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elevations" ADD CONSTRAINT "elevations_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elevations" ADD CONSTRAINT "elevations_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "elevations" ADD CONSTRAINT "elevations_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_child_item_lists" ADD CONSTRAINT "estimating_db_child_item_lists_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_child_item_lists" ADD CONSTRAINT "estimating_db_child_item_lists_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_child_list_items" ADD CONSTRAINT "estimating_db_child_list_items_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_child_list_items" ADD CONSTRAINT "estimating_db_child_list_items_child_item_list_id_fkey" FOREIGN KEY ("child_item_list_id") REFERENCES "estimating_db_child_item_lists"("child_item_list_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_child_list_items" ADD CONSTRAINT "estimating_db_child_list_items_sub_child_item_list_id_fkey" FOREIGN KEY ("sub_child_item_list_id") REFERENCES "estimating_db_child_item_lists"("child_item_list_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_groups" ADD CONSTRAINT "estimating_db_groups_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_groups" ADD CONSTRAINT "estimating_db_groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_groups" ADD CONSTRAINT "estimating_db_groups_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_groups" ADD CONSTRAINT "estimating_db_groups_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_groups" ADD CONSTRAINT "estimating_db_groups_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_items" ADD CONSTRAINT "estimating_db_items_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_items" ADD CONSTRAINT "estimating_db_items_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_items_po_index" ADD CONSTRAINT "estimating_db_items_po_index_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_items_po_index" ADD CONSTRAINT "estimating_db_items_po_index_estimating_db_item_id_fkey" FOREIGN KEY ("estimating_db_item_id") REFERENCES "estimating_db_items"("estimating_db_item_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "estimating_db_items_po_index" ADD CONSTRAINT "estimating_db_items_po_index_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "field_label_templates" ADD CONSTRAINT "field_label_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "field_label_templates" ADD CONSTRAINT "field_label_templates_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "field_labels" ADD CONSTRAINT "field_labels_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "field_labels" ADD CONSTRAINT "field_labels_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "field_labels" ADD CONSTRAINT "field_labels_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_community" ADD CONSTRAINT "floor_plan_community_master_id_fkey" FOREIGN KEY ("floor_plan_master_id") REFERENCES "floor_plan_master"("floor_plan_master_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_community" ADD CONSTRAINT "floor_plans_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_community" ADD CONSTRAINT "floor_plans_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_community" ADD CONSTRAINT "floor_plans_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_images" ADD CONSTRAINT "floor_plan_images_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_images" ADD CONSTRAINT "floor_plan_images_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_images" ADD CONSTRAINT "floor_plan_images_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_master" ADD CONSTRAINT "floor_plan_master_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_master" ADD CONSTRAINT "floor_plan_master_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_master" ADD CONSTRAINT "floor_plan_master_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_master" ADD CONSTRAINT "floor_plan_master_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_pricing_history" ADD CONSTRAINT "floor_plan_pricing_history_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_pricing_history" ADD CONSTRAINT "floor_plan_pricing_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_pricing_history" ADD CONSTRAINT "floor_plan_pricing_history_floor_plan_id_fkey" FOREIGN KEY ("floor_plan_id") REFERENCES "floor_plan_community"("floor_plan_community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_room_sizes" ADD CONSTRAINT "floor_plan_room_sizes_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_room_sizes" ADD CONSTRAINT "floor_plan_room_sizes_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "floor_plan_room_sizes" ADD CONSTRAINT "floor_plan_room_sizes_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_deficiencies" ADD CONSTRAINT "home_inspection_deficiencies_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_deficiencies" ADD CONSTRAINT "home_inspection_deficiencies_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_deficiencies" ADD CONSTRAINT "home_inspection_deficiencies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_deficiencies" ADD CONSTRAINT "home_inspection_deficiencies_home_inspection_id_fkey" FOREIGN KEY ("home_inspection_id") REFERENCES "home_inspections"("home_inspection_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_deficiencies" ADD CONSTRAINT "home_inspection_deficiencies_home_inspection_item_id_fkey" FOREIGN KEY ("home_inspection_item_id") REFERENCES "home_inspection_items"("home_inspection_item_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_deficiencies" ADD CONSTRAINT "home_inspection_deficiencies_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_deficiencies_images" ADD CONSTRAINT "home_inspection_deficiencies__home_inspection_deficiency_i_fkey" FOREIGN KEY ("home_inspection_deficiency_id") REFERENCES "home_inspection_deficiencies"("home_inspection_deficiency_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_deficiencies_images" ADD CONSTRAINT "home_inspection_deficiencies_images_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_deficiencies_images" ADD CONSTRAINT "home_inspection_deficiencies_images_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_deficiencies_images" ADD CONSTRAINT "home_inspection_deficiencies_images_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_deficiencies_images" ADD CONSTRAINT "home_inspection_deficiencies_images_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_items" ADD CONSTRAINT "home_inspection_items_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_items" ADD CONSTRAINT "home_inspection_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_items" ADD CONSTRAINT "home_inspection_items_home_inspection_id_fkey" FOREIGN KEY ("home_inspection_id") REFERENCES "home_inspections"("home_inspection_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspection_items" ADD CONSTRAINT "home_inspection_items_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspections" ADD CONSTRAINT "home_inspections_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspections" ADD CONSTRAINT "home_inspections_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspections" ADD CONSTRAINT "home_inspections_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspections" ADD CONSTRAINT "home_inspections_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "homes"("home_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspections" ADD CONSTRAINT "home_inspections_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("job_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspections" ADD CONSTRAINT "home_inspections_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_inspections" ADD CONSTRAINT "home_inspections_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selection_sheet_response" ADD CONSTRAINT "home_selection_sheet_response_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selection_sheet_response" ADD CONSTRAINT "home_selection_sheet_response_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selection_sheet_response" ADD CONSTRAINT "home_selection_sheet_response_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selection_sheet_response" ADD CONSTRAINT "home_selection_sheet_response_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "homes"("home_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selection_sheet_response" ADD CONSTRAINT "home_selection_sheet_response_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("job_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selection_sheet_response" ADD CONSTRAINT "home_selection_sheet_response_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selection_sheet_response" ADD CONSTRAINT "home_selection_sheet_response_selection_sheet_question_id_fkey" FOREIGN KEY ("selection_sheet_question_id") REFERENCES "selection_sheet_question"("selection_sheet_question_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selections" ADD CONSTRAINT "home_selections_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selections" ADD CONSTRAINT "home_selections_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selections" ADD CONSTRAINT "home_selections_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selections" ADD CONSTRAINT "home_selections_deposit_posted_by_fkey" FOREIGN KEY ("deposit_posted_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selections" ADD CONSTRAINT "home_selections_inventory_home_co_master_id_fkey" FOREIGN KEY ("inventory_home_co_master_id") REFERENCES "inventory_home_co_master"("inventory_home_co_master_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selections" ADD CONSTRAINT "home_selections_inventory_home_id_fkey" FOREIGN KEY ("inventory_home_id") REFERENCES "inventory_homes"("inventory_home_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selections" ADD CONSTRAINT "home_selections_locked_by_estimating_user_id_fkey" FOREIGN KEY ("locked_by_estimating_user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selections" ADD CONSTRAINT "home_selections_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selections" ADD CONSTRAINT "home_selections_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "options"("option_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selections" ADD CONSTRAINT "home_selections_quote_contract_co_master_id_fkey" FOREIGN KEY ("quote_contract_co_master_id") REFERENCES "quote_contract_co_master"("quote_contract_co_master_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "home_selections" ADD CONSTRAINT "home_selections_quote_contract_id_fkey" FOREIGN KEY ("quote_contract_id") REFERENCES "quote_contracts"("quote_contract_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "homes" ADD CONSTRAINT "homes_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "homes" ADD CONSTRAINT "homes_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "homes" ADD CONSTRAINT "homes_floor_plan_id_fkey" FOREIGN KEY ("floor_plan_id") REFERENCES "floor_plan_community"("floor_plan_community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "homes" ADD CONSTRAINT "homes_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_checklist_items" ADD CONSTRAINT "inspection_checklist_items_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_checklist_items" ADD CONSTRAINT "inspection_checklist_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_checklist_items" ADD CONSTRAINT "inspection_checklist_items_inspection_checklist_id_fkey" FOREIGN KEY ("inspection_checklist_id") REFERENCES "inspection_checklists"("inspection_checklist_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_checklist_items" ADD CONSTRAINT "inspection_checklist_items_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_checklists" ADD CONSTRAINT "inspection_checklists_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_checklists" ADD CONSTRAINT "inspection_checklists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_checklists" ADD CONSTRAINT "inspection_checklists_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_checklists" ADD CONSTRAINT "inspection_checklists_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_deficiency_pick_lists" ADD CONSTRAINT "inspection_deficiency_pick_lists_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_deficiency_pick_lists" ADD CONSTRAINT "inspection_deficiency_pick_lists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_deficiency_pick_lists" ADD CONSTRAINT "inspection_deficiency_pick_lists_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_quality_grades" ADD CONSTRAINT "inspection_quality_grades_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_quality_grades" ADD CONSTRAINT "inspection_quality_grades_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inspection_quality_grades" ADD CONSTRAINT "inspection_quality_grades_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_home_co_master" ADD CONSTRAINT "inventory_home_co_master_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_home_co_master" ADD CONSTRAINT "inventory_home_co_master_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_home_co_master" ADD CONSTRAINT "inventory_home_co_master_final_approval_by_fkey" FOREIGN KEY ("final_approval_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_home_co_master" ADD CONSTRAINT "inventory_home_co_master_final_approval_rescinded_by_fkey" FOREIGN KEY ("final_approval_rescinded_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_home_co_master" ADD CONSTRAINT "inventory_home_co_master_inventory_home_id_fkey" FOREIGN KEY ("inventory_home_id") REFERENCES "inventory_homes"("inventory_home_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_home_co_master" ADD CONSTRAINT "inventory_home_co_master_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_home_types" ADD CONSTRAINT "inventory_home_types_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes" ADD CONSTRAINT "inventory_homes_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes" ADD CONSTRAINT "inventory_homes_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes" ADD CONSTRAINT "inventory_homes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes" ADD CONSTRAINT "inventory_homes_design_center_sales_person_id_fkey" FOREIGN KEY ("design_center_sales_person_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes" ADD CONSTRAINT "inventory_homes_elevation_id_fkey" FOREIGN KEY ("elevation_id") REFERENCES "elevations"("elevation_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes" ADD CONSTRAINT "inventory_homes_estimator_id_fkey" FOREIGN KEY ("estimator_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes" ADD CONSTRAINT "inventory_homes_floor_plan_id_fkey" FOREIGN KEY ("floor_plan_id") REFERENCES "floor_plan_community"("floor_plan_community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes" ADD CONSTRAINT "inventory_homes_lot_id_fkey" FOREIGN KEY ("lot_inventory_id") REFERENCES "lots"("lot_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes" ADD CONSTRAINT "inventory_homes_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes" ADD CONSTRAINT "inventory_homes_project_manager_id_fkey" FOREIGN KEY ("project_manager_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes" ADD CONSTRAINT "inventory_homes_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes" ADD CONSTRAINT "inventory_homes_sales_person_id_fkey" FOREIGN KEY ("sales_person_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes_custom_fields" ADD CONSTRAINT "inventory_homes_custom_fields_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes_custom_fields" ADD CONSTRAINT "inventory_homes_custom_fields_inventory_home_id_fkey" FOREIGN KEY ("inventory_home_id") REFERENCES "inventory_homes"("inventory_home_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes_room_sizes" ADD CONSTRAINT "inventory_homes_room_sizes_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory_homes_room_sizes" ADD CONSTRAINT "inventory_homes_room_sizes_inventory_home_id_fkey" FOREIGN KEY ("inventory_home_id") REFERENCES "inventory_homes"("inventory_home_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ap_invoice_items" ADD CONSTRAINT "ap_invoice_items_ap_invoice_id_fkey" FOREIGN KEY ("ap_invoice_id") REFERENCES "ap_invoices"("ap_invoice_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ap_invoice_items" ADD CONSTRAINT "ap_invoice_items_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ap_invoice_items" ADD CONSTRAINT "ap_invoice_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ap_invoice_items" ADD CONSTRAINT "ap_invoice_items_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ap_invoices" ADD CONSTRAINT "ap_invoices_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ap_invoices" ADD CONSTRAINT "ap_invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ap_invoices" ADD CONSTRAINT "ap_invoices_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ap_invoices" ADD CONSTRAINT "ap_invoices_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ap_invoices" ADD CONSTRAINT "ap_invoices_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_estimate_items" ADD CONSTRAINT "job_estimate_items_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_estimate_items" ADD CONSTRAINT "job_estimate_items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_estimate_items" ADD CONSTRAINT "job_estimate_items_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_estimate_items" ADD CONSTRAINT "job_estimate_items_home_selection_id_fkey" FOREIGN KEY ("home_selection_id") REFERENCES "home_selections"("home_selection_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_estimate_items" ADD CONSTRAINT "job_estimate_items_inventory_home_id_fkey" FOREIGN KEY ("inventory_home_id") REFERENCES "inventory_homes"("inventory_home_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_estimate_items" ADD CONSTRAINT "job_estimate_items_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_estimate_items" ADD CONSTRAINT "job_estimate_items_quote_contract_id_fkey" FOREIGN KEY ("quote_contract_id") REFERENCES "quote_contracts"("quote_contract_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_estimate_items" ADD CONSTRAINT "job_estimate_items_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_estimate_items" ADD CONSTRAINT "job_estimate_items_region_id_job_number_unit_number_fkey" FOREIGN KEY ("region_id", "job_number", "unit_number") REFERENCES "job_unit_numbers"("region_id", "job_number", "unit_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_purchase_order_index" ADD CONSTRAINT "job_purchase_order_index_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_purchase_order_index" ADD CONSTRAINT "job_purchase_order_index_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_purchase_order_index" ADD CONSTRAINT "job_purchase_order_index_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_purchase_order_index" ADD CONSTRAINT "job_purchase_order_index_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_purchase_order_index" ADD CONSTRAINT "job_purchase_order_index_region_id_job_number_unit_number_fkey" FOREIGN KEY ("region_id", "job_number", "unit_number") REFERENCES "job_unit_numbers"("region_id", "job_number", "unit_number") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_unit_numbers" ADD CONSTRAINT "job_unit_numbers_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_unit_numbers" ADD CONSTRAINT "job_unit_numbers_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_unit_numbers" ADD CONSTRAINT "job_unit_numbers_estimator_id_fkey" FOREIGN KEY ("estimator_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_unit_numbers" ADD CONSTRAINT "job_unit_numbers_project_manager_id_fkey" FOREIGN KEY ("project_manager_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_unit_numbers" ADD CONSTRAINT "job_unit_numbers_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_unit_numbers" ADD CONSTRAINT "job_unit_numbers_region_id_job_number_fkey" FOREIGN KEY ("region_id", "job_number") REFERENCES "jobs"("region_id", "job_number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_unit_numbers" ADD CONSTRAINT "job_unit_numbers_site_superintendent_id_fkey" FOREIGN KEY ("site_superintendent_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_unit_numbers" ADD CONSTRAINT "job_unit_numbers_warranty_rep_id_fkey" FOREIGN KEY ("warranty_rep_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_unit_numbers" ADD CONSTRAINT "job_unit_numbers_warranty_service_rep_id_fkey" FOREIGN KEY ("warranty_service_rep_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_unit_numbers_custom_fields" ADD CONSTRAINT "job_unit_numbers_custom_field_region_id_job_number_unit_nu_fkey" FOREIGN KEY ("region_id", "job_number", "unit_number") REFERENCES "job_unit_numbers"("region_id", "job_number", "unit_number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_unit_numbers_custom_fields" ADD CONSTRAINT "job_unit_numbers_custom_fields_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "job_unit_numbers_custom_fields" ADD CONSTRAINT "job_unit_numbers_custom_fields_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "jobs_custom_fields" ADD CONSTRAINT "jobs_custom_fields_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "jobs_custom_fields" ADD CONSTRAINT "jobs_custom_fields_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "jobs_custom_fields" ADD CONSTRAINT "jobs_custom_fields_region_id_job_number_fkey" FOREIGN KEY ("region_id", "job_number") REFERENCES "jobs"("region_id", "job_number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lender_contacts" ADD CONSTRAINT "lender_contacts_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lender_contacts" ADD CONSTRAINT "lender_contacts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lender_contacts" ADD CONSTRAINT "lender_contacts_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lender_loan_draw_items" ADD CONSTRAINT "lender_loan_draw_items_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lender_loan_draw_items" ADD CONSTRAINT "lender_loan_draw_items_loan_draw_template_id_fkey" FOREIGN KEY ("loan_draw_template_id") REFERENCES "lender_loan_draw_templates"("loan_draw_template_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lender_loan_draw_templates" ADD CONSTRAINT "lender_loan_draw_templates_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lenders" ADD CONSTRAINT "lenders_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lenders" ADD CONSTRAINT "lenders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lenders" ADD CONSTRAINT "lenders_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lenders" ADD CONSTRAINT "lenders_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_templates" ADD CONSTRAINT "lien_templates_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_templates" ADD CONSTRAINT "lien_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_templates" ADD CONSTRAINT "lien_templates_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_waiver_details" ADD CONSTRAINT "lien_waiver_details_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_waiver_details" ADD CONSTRAINT "lien_waiver_details_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_waiver_details" ADD CONSTRAINT "lien_waiver_details_lien_waiver_master_id_fkey" FOREIGN KEY ("lien_waiver_master_id") REFERENCES "lien_waiver_master"("lien_waiver_master_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_waiver_details" ADD CONSTRAINT "lien_waiver_details_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_waiver_details" ADD CONSTRAINT "lien_waiver_details_po_master_id_fkey" FOREIGN KEY ("po_master_id") REFERENCES "po_master"("po_master_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_waiver_master" ADD CONSTRAINT "lien_waiver_master_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_waiver_master" ADD CONSTRAINT "lien_waiver_master_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_waiver_master" ADD CONSTRAINT "lien_waiver_master_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("job_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_waiver_master" ADD CONSTRAINT "lien_waiver_master_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lien_waiver_master" ADD CONSTRAINT "lien_waiver_master_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lot_custom_fields" ADD CONSTRAINT "lot_custom_fields_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("lot_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lot_custom_fields" ADD CONSTRAINT "lot_inventory_custom_fields_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lot_required_options" ADD CONSTRAINT "lot_inventory_required_options_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lot_required_options" ADD CONSTRAINT "lot_required_options_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("lot_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lot_sales_history" ADD CONSTRAINT "lot_inventory_sales_history_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lot_sales_history" ADD CONSTRAINT "lot_inventory_sales_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lot_sales_history" ADD CONSTRAINT "lot_sales_history_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("lot_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lot_status" ADD CONSTRAINT "lot_status_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lot_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("division_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lot_inventory_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lot_inventory_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lot_inventory_community_phase_id_fkey" FOREIGN KEY ("community_phase_id") REFERENCES "community_phase"("community_phase_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lot_inventory_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lot_inventory_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lot_inventory_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_contact1_id_fkey" FOREIGN KEY ("contact1_id") REFERENCES "contacts"("contact_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_contact2_id_fkey" FOREIGN KEY ("contact2_id") REFERENCES "contacts"("contact_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_contact3_id_fkey" FOREIGN KEY ("contact3_id") REFERENCES "contacts"("contact_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_contact4_id_fkey" FOREIGN KEY ("contact4_id") REFERENCES "contacts"("contact_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_contact5_id_fkey" FOREIGN KEY ("contact5_id") REFERENCES "contacts"("contact_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_design_center_person_id_fkey" FOREIGN KEY ("design_center_person_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_sales_person_id_fkey" FOREIGN KEY ("sales_person_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities_custom_fields" ADD CONSTRAINT "opportunities_custom_fields_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunities_custom_fields" ADD CONSTRAINT "opportunities_custom_fields_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("opportunity_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunity" ADD CONSTRAINT "opportunity_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunity_custom_fields" ADD CONSTRAINT "opportunity_custom_fields_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunity_custom_fields" ADD CONSTRAINT "opportunity_custom_fields_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunity_custom_fields" ADD CONSTRAINT "opportunity_custom_fields_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "opportunity_custom_fields" ADD CONSTRAINT "opportunity_custom_fields_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunity"("opportunity_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_categories" ADD CONSTRAINT "option_categories_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_categories" ADD CONSTRAINT "option_categories_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_images" ADD CONSTRAINT "option_images_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_images" ADD CONSTRAINT "option_images_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_images" ADD CONSTRAINT "option_images_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_package_details" ADD CONSTRAINT "option_package_details_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_package_details" ADD CONSTRAINT "option_package_details_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_package_details" ADD CONSTRAINT "option_package_details_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_package_details" ADD CONSTRAINT "option_package_details_option_package_id_fkey" FOREIGN KEY ("option_package_id") REFERENCES "option_packages"("option_package_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_packages" ADD CONSTRAINT "option_packages_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_packages" ADD CONSTRAINT "option_packages_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_packages" ADD CONSTRAINT "option_packages_community_phase_id_fkey" FOREIGN KEY ("community_phase_id") REFERENCES "community_phase"("community_phase_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_packages" ADD CONSTRAINT "option_packages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_packages" ADD CONSTRAINT "option_packages_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_packages" ADD CONSTRAINT "option_packages_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_room_size_changes" ADD CONSTRAINT "option_room_size_changes_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_room_size_changes" ADD CONSTRAINT "option_room_size_changes_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_rules" ADD CONSTRAINT "option_rules_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_rules" ADD CONSTRAINT "option_rules_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_rules" ADD CONSTRAINT "option_rules_community_phase_id_fkey" FOREIGN KEY ("community_phase_id") REFERENCES "community_phase"("community_phase_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_rules" ADD CONSTRAINT "option_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_rules" ADD CONSTRAINT "option_rules_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_rules" ADD CONSTRAINT "option_rules_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_subcategories" ADD CONSTRAINT "option_subcategories_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "option_subcategories" ADD CONSTRAINT "option_subcategories_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_correspondence" ADD CONSTRAINT "po_correspondence_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_correspondence" ADD CONSTRAINT "po_correspondence_builder_supplier_id_fkey" FOREIGN KEY ("builder_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_correspondence" ADD CONSTRAINT "po_correspondence_builders_user_id_fkey" FOREIGN KEY ("builders_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_correspondence" ADD CONSTRAINT "po_correspondence_po_master_id_fkey" FOREIGN KEY ("po_master_id") REFERENCES "po_master"("po_master_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_correspondence" ADD CONSTRAINT "po_correspondence_supplier_contact_id_fkey" FOREIGN KEY ("supplier_contact_id") REFERENCES "supplier_contacts"("supplier_contact_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_group" ADD CONSTRAINT "po_group_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_group" ADD CONSTRAINT "po_group_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_group" ADD CONSTRAINT "po_group_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_group" ADD CONSTRAINT "po_group_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items" ADD CONSTRAINT "po_items_approved_for_payment_by_fkey" FOREIGN KEY ("approved_for_payment_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items" ADD CONSTRAINT "po_items_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items" ADD CONSTRAINT "po_items_estimating_db_item_id_fkey" FOREIGN KEY ("estimating_db_item_id") REFERENCES "estimating_db_items"("estimating_db_item_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items" ADD CONSTRAINT "po_items_inventory_home_id_fkey" FOREIGN KEY ("inventory_home_id") REFERENCES "inventory_homes"("inventory_home_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items" ADD CONSTRAINT "po_items_po_master_id_fkey" FOREIGN KEY ("po_master_id") REFERENCES "po_master"("po_master_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items" ADD CONSTRAINT "po_items_quote_contract_id_fkey" FOREIGN KEY ("quote_contract_id") REFERENCES "quote_contracts"("quote_contract_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items" ADD CONSTRAINT "po_items_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items" ADD CONSTRAINT "po_items_schedule_task_id_fkey" FOREIGN KEY ("schedule_task_id") REFERENCES "schedule_tasks"("schedule_task_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items_co" ADD CONSTRAINT "po_items_co_approved_for_payment_by_fkey" FOREIGN KEY ("approved_for_payment_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items_co" ADD CONSTRAINT "po_items_co_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items_co" ADD CONSTRAINT "po_items_co_estimating_db_item_id_fkey" FOREIGN KEY ("estimating_db_item_id") REFERENCES "estimating_db_items"("estimating_db_item_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items_co" ADD CONSTRAINT "po_items_co_inventory_home_id_fkey" FOREIGN KEY ("inventory_home_id") REFERENCES "inventory_homes"("inventory_home_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items_co" ADD CONSTRAINT "po_items_co_po_items_id_fkey" FOREIGN KEY ("po_items_id") REFERENCES "po_items"("po_items_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items_co" ADD CONSTRAINT "po_items_co_po_master_co_id_fkey" FOREIGN KEY ("po_master_co_id") REFERENCES "po_master_co"("po_master_co_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_items_co" ADD CONSTRAINT "po_items_co_quote_contract_id_fkey" FOREIGN KEY ("quote_contract_id") REFERENCES "quote_contracts"("quote_contract_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_approved_for_payment_by_fkey" FOREIGN KEY ("approved_for_payment_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_ordered_by_fkey" FOREIGN KEY ("ordered_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_pay_point1_approved_by_fkey" FOREIGN KEY ("pay_point1_approved_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_pay_point2_approved_by_fkey" FOREIGN KEY ("pay_point2_approved_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_pay_point3_approved_by_fkey" FOREIGN KEY ("pay_point3_approved_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_pay_point4_approved_by_fkey" FOREIGN KEY ("pay_point4_approved_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_pay_point5_approved_by_fkey" FOREIGN KEY ("pay_point5_approved_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_supplier_acknowledged_user_fkey" FOREIGN KEY ("supplier_acknowledged_user") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_supplier_cancel_acknowledged_user_fkey" FOREIGN KEY ("supplier_cancel_acknowledged_user") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master" ADD CONSTRAINT "po_master_viewed_by_supplier_user_id_fkey" FOREIGN KEY ("viewed_by_supplier_user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_approved_for_payment_by_fkey" FOREIGN KEY ("approved_for_payment_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_ordered_by_fkey" FOREIGN KEY ("ordered_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_pay_point1_approved_by_fkey" FOREIGN KEY ("pay_point1_approved_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_pay_point2_approved_by_fkey" FOREIGN KEY ("pay_point2_approved_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_pay_point3_approved_by_fkey" FOREIGN KEY ("pay_point3_approved_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_pay_point4_approved_by_fkey" FOREIGN KEY ("pay_point4_approved_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_pay_point5_approved_by_fkey" FOREIGN KEY ("pay_point5_approved_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_po_master_id_fkey" FOREIGN KEY ("po_master_id") REFERENCES "po_master"("po_master_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_supplier_acknowledged_user_fkey" FOREIGN KEY ("supplier_acknowledged_user") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_supplier_cancel_acknowledged_user_fkey" FOREIGN KEY ("supplier_cancel_acknowledged_user") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_master_co" ADD CONSTRAINT "po_master_co_viewed_by_supplier_user_id_fkey" FOREIGN KEY ("viewed_by_supplier_user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_sequential_numbers" ADD CONSTRAINT "po_sequential_numbers_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_viewing_history" ADD CONSTRAINT "po_viewing_history_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_viewing_history" ADD CONSTRAINT "po_viewing_history_builder_supplier_id_fkey" FOREIGN KEY ("builder_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_viewing_history" ADD CONSTRAINT "po_viewing_history_po_master_id_fkey" FOREIGN KEY ("po_master_id") REFERENCES "po_master"("po_master_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "po_viewing_history" ADD CONSTRAINT "po_viewing_history_supplier_contact_id_fkey" FOREIGN KEY ("supplier_contact_id") REFERENCES "supplier_contacts"("supplier_contact_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "posting_batches" ADD CONSTRAINT "posting_batches_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "posting_batches" ADD CONSTRAINT "posting_batches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "posting_batches" ADD CONSTRAINT "posting_batches_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "posting_batches" ADD CONSTRAINT "posting_batches_repost_batch_id_fkey" FOREIGN KEY ("repost_batch_id") REFERENCES "posting_batches"("batch_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_co_master" ADD CONSTRAINT "quote_contract_co_master_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_co_master" ADD CONSTRAINT "quote_contract_co_master_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_co_master" ADD CONSTRAINT "quote_contract_co_master_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_co_master" ADD CONSTRAINT "quote_contract_co_master_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_co_master" ADD CONSTRAINT "quote_contract_co_master_quote_contract_id_fkey" FOREIGN KEY ("quote_contract_id") REFERENCES "quote_contracts"("quote_contract_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_deposits" ADD CONSTRAINT "quote_contract_deposits_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_deposits" ADD CONSTRAINT "quote_contract_deposits_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_deposits" ADD CONSTRAINT "quote_contract_deposits_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_deposits" ADD CONSTRAINT "quote_contract_deposits_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_deposits" ADD CONSTRAINT "quote_contract_deposits_quote_contract_id_fkey" FOREIGN KEY ("quote_contract_id") REFERENCES "quote_contracts"("quote_contract_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_room_sizes" ADD CONSTRAINT "quote_contract_room_sizes_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_room_sizes" ADD CONSTRAINT "quote_contract_room_sizes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_room_sizes" ADD CONSTRAINT "quote_contract_room_sizes_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contract_room_sizes" ADD CONSTRAINT "quote_contract_room_sizes_quote_contract_id_fkey" FOREIGN KEY ("quote_contract_id") REFERENCES "quote_contracts"("quote_contract_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts" ADD CONSTRAINT "quote_contracts_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts" ADD CONSTRAINT "quote_contracts_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts" ADD CONSTRAINT "quote_contracts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts" ADD CONSTRAINT "quote_contracts_elevation_id_fkey" FOREIGN KEY ("elevation_id") REFERENCES "elevations"("elevation_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts" ADD CONSTRAINT "quote_contracts_floor_plan_id_fkey" FOREIGN KEY ("floor_plan_id") REFERENCES "floor_plan_community"("floor_plan_community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts" ADD CONSTRAINT "quote_contracts_lot_id_fkey" FOREIGN KEY ("lot_inventory_id") REFERENCES "lots"("lot_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts" ADD CONSTRAINT "quote_contracts_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts" ADD CONSTRAINT "quote_contracts_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("opportunity_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts" ADD CONSTRAINT "quote_contracts_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts" ADD CONSTRAINT "quote_contracts_sales_person_id_fkey" FOREIGN KEY ("sales_person_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts_allowances" ADD CONSTRAINT "quote_contracts_allowances_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts_allowances" ADD CONSTRAINT "quote_contracts_allowances_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts_allowances" ADD CONSTRAINT "quote_contracts_allowances_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts_allowances" ADD CONSTRAINT "quote_contracts_allowances_quote_contract_id_fkey" FOREIGN KEY ("quote_contract_id") REFERENCES "quote_contracts"("quote_contract_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts_custom_fields" ADD CONSTRAINT "quote_contracts_custom_fields_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts_custom_fields" ADD CONSTRAINT "quote_contracts_custom_fields_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts_custom_fields" ADD CONSTRAINT "quote_contracts_custom_fields_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quote_contracts_custom_fields" ADD CONSTRAINT "quote_contracts_custom_fields_quote_contract_id_fkey" FOREIGN KEY ("quote_contract_id") REFERENCES "quote_contracts"("quote_contract_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_master" ADD CONSTRAINT "room_master_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_master" ADD CONSTRAINT "room_master_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_master" ADD CONSTRAINT "room_master_inactive_by_fkey" FOREIGN KEY ("inactive_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_master" ADD CONSTRAINT "room_master_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_master" ADD CONSTRAINT "room_master_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_subcategories" ADD CONSTRAINT "room_subcategories_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_subcategories" ADD CONSTRAINT "room_subcategories_builder_id_region_id_room_location_fkey" FOREIGN KEY ("builder_id", "region_id", "room_location") REFERENCES "room_master"("builder_id", "region_id", "room_location") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_subcategories" ADD CONSTRAINT "room_subcategories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_subcategories" ADD CONSTRAINT "room_subcategories_inactive_by_fkey" FOREIGN KEY ("inactive_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_subcategories" ADD CONSTRAINT "room_subcategories_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "room_subcategories" ADD CONSTRAINT "room_subcategories_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sage_intacct_departments" ADD CONSTRAINT "sage_intacct_departments_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sage_intacct_departments" ADD CONSTRAINT "sage_intacct_departments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sage_intacct_departments" ADD CONSTRAINT "sage_intacct_departments_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sage_intacct_entities" ADD CONSTRAINT "sage_intacct_entities_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sage_intacct_entities" ADD CONSTRAINT "sage_intacct_entities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sage_intacct_entities" ADD CONSTRAINT "sage_intacct_entities_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sage_intacct_locations" ADD CONSTRAINT "sage_intacct_locations_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sage_intacct_locations" ADD CONSTRAINT "sage_intacct_locations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sage_intacct_locations" ADD CONSTRAINT "sage_intacct_locations_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_price_sheet_details" ADD CONSTRAINT "sales_price_sheet_details_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_price_sheet_details" ADD CONSTRAINT "sales_price_sheet_details_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_price_sheet_details" ADD CONSTRAINT "sales_price_sheet_details_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_price_sheet_details" ADD CONSTRAINT "sales_price_sheet_details_sales_price_sheet_master_id_fkey" FOREIGN KEY ("sales_price_sheet_master_id") REFERENCES "sales_price_sheet_master"("sales_price_sheet_master_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_price_sheet_master" ADD CONSTRAINT "sales_price_sheet_master_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_price_sheet_master" ADD CONSTRAINT "sales_price_sheet_master_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_price_sheet_master" ADD CONSTRAINT "sales_price_sheet_master_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_price_sheet_master" ADD CONSTRAINT "sales_price_sheet_master_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_price_sheet_master" ADD CONSTRAINT "sales_price_sheet_master_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales_price_sheet_master" ADD CONSTRAINT "sales_price_sheet_master_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_master_qc_items" ADD CONSTRAINT "schedule_master_qc_items_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_master_qc_items" ADD CONSTRAINT "schedule_master_qc_items_qc_section_id_fkey" FOREIGN KEY ("qc_section_id") REFERENCES "schedule_master_qc_sections"("qc_section_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_master_qc_lists" ADD CONSTRAINT "schedule_master_qc_lists_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_master_qc_sections" ADD CONSTRAINT "schedule_master_qc_sections_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_master_qc_sections" ADD CONSTRAINT "schedule_master_qc_sections_qc_list_id_fkey" FOREIGN KEY ("qc_list_id") REFERENCES "schedule_master_qc_lists"("qc_list_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_master_task_list" ADD CONSTRAINT "schedule_master_task_list_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_master_task_list" ADD CONSTRAINT "schedule_master_task_list_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "schedule_master_task_list"("schedule_master_task_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_master_task_list" ADD CONSTRAINT "schedule_master_task_list_qc_list_id_fkey" FOREIGN KEY ("qc_list_id") REFERENCES "schedule_master_qc_lists"("qc_list_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_master_task_list" ADD CONSTRAINT "schedule_master_task_list_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_qc_sections" ADD CONSTRAINT "schedule_qc_sections_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_qc_sections" ADD CONSTRAINT "schedule_qc_sections_schedule_task_id_fkey" FOREIGN KEY ("schedule_task_id") REFERENCES "schedule_tasks"("schedule_task_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_activity_log" ADD CONSTRAINT "schedule_task_activity_log_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_activity_log" ADD CONSTRAINT "schedule_task_activity_log_builder_user_id_fkey" FOREIGN KEY ("builder_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_activity_log" ADD CONSTRAINT "schedule_task_activity_log_builders_supplier_id_fkey" FOREIGN KEY ("builders_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_activity_log" ADD CONSTRAINT "schedule_task_activity_log_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_activity_log" ADD CONSTRAINT "schedule_task_activity_log_schedule_task_id_fkey" FOREIGN KEY ("schedule_task_id") REFERENCES "schedule_tasks"("schedule_task_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_constraints" ADD CONSTRAINT "schedule_task_constraints_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_constraints" ADD CONSTRAINT "schedule_task_constraints_predecessor_task_id_fkey" FOREIGN KEY ("predecessor_task_id") REFERENCES "schedule_tasks"("schedule_task_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_constraints" ADD CONSTRAINT "schedule_task_constraints_schedule_task_id_fkey" FOREIGN KEY ("schedule_task_id") REFERENCES "schedule_tasks"("schedule_task_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_history_log" ADD CONSTRAINT "schedule_task_history_log_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_history_log" ADD CONSTRAINT "schedule_task_history_log_builder_user_id_fkey" FOREIGN KEY ("builder_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_history_log" ADD CONSTRAINT "schedule_task_history_log_schedule_task_id_fkey" FOREIGN KEY ("schedule_task_id") REFERENCES "schedule_tasks"("schedule_task_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_history_log" ADD CONSTRAINT "schedule_task_history_log_supplier_user_id_fkey" FOREIGN KEY ("supplier_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_notifications" ADD CONSTRAINT "schedule_task_notifications_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_notifications" ADD CONSTRAINT "schedule_task_notifications_builders_supplier_id_fkey" FOREIGN KEY ("builders_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_notifications" ADD CONSTRAINT "schedule_task_notifications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_notifications" ADD CONSTRAINT "schedule_task_notifications_schedule_task_id_fkey" FOREIGN KEY ("schedule_task_id") REFERENCES "schedule_tasks"("schedule_task_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_qc_items" ADD CONSTRAINT "schedule_task_qc_items_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_qc_items" ADD CONSTRAINT "schedule_task_qc_items_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_qc_items" ADD CONSTRAINT "schedule_task_qc_items_qc_section_id_fkey" FOREIGN KEY ("qc_section_id") REFERENCES "schedule_qc_sections"("qc_section_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_task_qc_items" ADD CONSTRAINT "schedule_task_qc_items_schedule_task_id_fkey" FOREIGN KEY ("schedule_task_id") REFERENCES "schedule_tasks"("schedule_task_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_current_supplier_id_fkey" FOREIGN KEY ("current_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_internal_resource_id_fkey" FOREIGN KEY ("internal_resource_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_job_number_fkey" FOREIGN KEY ("job_number") REFERENCES "jobs"("job_number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_locked_by_fkey" FOREIGN KEY ("locked_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_on_hold_by_fkey" FOREIGN KEY ("on_hold_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_original_supplier_id_fkey" FOREIGN KEY ("original_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "schedule_tasks"("schedule_task_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_qc_list_id_fkey" FOREIGN KEY ("qc_list_id") REFERENCES "schedule_master_qc_lists"("qc_list_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_tasks" ADD CONSTRAINT "schedule_tasks_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_template_non_work_days" ADD CONSTRAINT "schedule_template_non_work_days_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_template_non_work_days" ADD CONSTRAINT "schedule_template_non_work_days_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "schedule_templates"("template_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_template_task_constraints" ADD CONSTRAINT "schedule_template_task_constraints_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_template_task_constraints" ADD CONSTRAINT "schedule_template_task_constraints_predecessor_task_id_fkey" FOREIGN KEY ("predecessor_task_id") REFERENCES "schedule_template_tasks"("schedule_master_task_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_template_task_constraints" ADD CONSTRAINT "schedule_template_task_constraints_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "schedule_template_tasks"("schedule_master_task_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_template_task_constraints" ADD CONSTRAINT "schedule_template_task_constraints_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "schedule_templates"("template_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_template_tasks" ADD CONSTRAINT "schedule_template_tasks_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_template_tasks" ADD CONSTRAINT "schedule_template_tasks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "schedule_template_tasks"("schedule_master_task_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_template_tasks" ADD CONSTRAINT "schedule_template_tasks_qc_list_id_fkey" FOREIGN KEY ("qc_list_id") REFERENCES "schedule_master_qc_lists"("qc_list_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_template_tasks" ADD CONSTRAINT "schedule_template_tasks_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "schedule_templates"("template_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_templates" ADD CONSTRAINT "schedule_templates_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_templates" ADD CONSTRAINT "schedule_templates_finish_task_id_fkey" FOREIGN KEY ("finish_task_id") REFERENCES "schedule_master_task_list"("schedule_master_task_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_templates" ADD CONSTRAINT "schedule_templates_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedule_templates" ADD CONSTRAINT "schedule_templates_start_task_id_fkey" FOREIGN KEY ("start_task_id") REFERENCES "schedule_master_task_list"("schedule_master_task_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_inventory_home_id_fkey" FOREIGN KEY ("inventory_home_id") REFERENCES "inventory_homes"("inventory_home_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_job_number_fkey" FOREIGN KEY ("job_number") REFERENCES "jobs"("job_number") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_on_hold_by_fkey" FOREIGN KEY ("on_hold_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_quote_contract_id_fkey" FOREIGN KEY ("quote_contract_id") REFERENCES "quote_contracts"("quote_contract_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "schedule_templates"("template_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scheduling_non_working_days" ADD CONSTRAINT "scheduling_non_working_days_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scheduling_non_working_days" ADD CONSTRAINT "scheduling_non_working_days_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scheduling_working_days" ADD CONSTRAINT "scheduling_working_days_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scheduling_working_days" ADD CONSTRAINT "scheduling_working_days_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "default_suppliers" ADD CONSTRAINT "default_suppliers_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "default_suppliers" ADD CONSTRAINT "default_suppliers_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "default_suppliers" ADD CONSTRAINT "default_suppliers_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "digital_signature_roles" ADD CONSTRAINT "digital_signature_roles_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "digital_signature_roles" ADD CONSTRAINT "digital_signature_roles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "digital_signature_roles" ADD CONSTRAINT "digital_signature_roles_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "insurance_types" ADD CONSTRAINT "insurance_types_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "real_estate_brokers" ADD CONSTRAINT "real_estate_brokers_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "real_estate_brokers" ADD CONSTRAINT "real_estate_brokers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "real_estate_brokers" ADD CONSTRAINT "real_estate_brokers_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realtors" ADD CONSTRAINT "realtors_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realtors" ADD CONSTRAINT "realtors_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realtors" ADD CONSTRAINT "realtors_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "realtors" ADD CONSTRAINT "realtors_real_estate_broker_id_fkey" FOREIGN KEY ("real_estate_broker_id") REFERENCES "real_estate_brokers"("real_estate_broker_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("division_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shopping_cart_selection_sheet_response" ADD CONSTRAINT "shopping_cart_selection_sheet_re_customer_shopping_cart_id_fkey" FOREIGN KEY ("customer_shopping_cart_id") REFERENCES "customer_shopping_cart"("customer_shopping_cart_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shopping_cart_selection_sheet_response" ADD CONSTRAINT "shopping_cart_selection_sheet_response_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shopping_cart_selection_sheet_response" ADD CONSTRAINT "shopping_cart_selection_sheet_response_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shopping_cart_selection_sheet_response" ADD CONSTRAINT "shopping_cart_selection_sheet_response_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "system_user_audit" ADD CONSTRAINT "system_user_audit_from_builder_id_fkey" FOREIGN KEY ("from_builder_id") REFERENCES "builders"("builder_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "system_user_audit" ADD CONSTRAINT "system_user_audit_to_builder_id_fkey" FOREIGN KEY ("to_builder_id") REFERENCES "builders"("builder_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "system_user_audit" ADD CONSTRAINT "system_user_audit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tax_groups" ADD CONSTRAINT "tax_groups_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tax_groups" ADD CONSTRAINT "tax_groups_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tax_groups" ADD CONSTRAINT "tax_groups_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variance_po" ADD CONSTRAINT "variance_po_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variance_po" ADD CONSTRAINT "variance_po_back_charge_builder_supplier_id_fkey" FOREIGN KEY ("back_charge_builder_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variance_po" ADD CONSTRAINT "variance_po_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variance_po" ADD CONSTRAINT "variance_po_builders_supplier_id_fkey" FOREIGN KEY ("builders_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variance_po" ADD CONSTRAINT "variance_po_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variance_po" ADD CONSTRAINT "variance_po_declined_by_fkey" FOREIGN KEY ("declined_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variance_po" ADD CONSTRAINT "variance_po_po_master_id_fkey" FOREIGN KEY ("po_master_id") REFERENCES "po_master"("po_master_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variance_po" ADD CONSTRAINT "variance_po_purchaser_id_fkey" FOREIGN KEY ("purchaser_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variance_po" ADD CONSTRAINT "variance_po_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variance_po" ADD CONSTRAINT "variance_po_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variance_po" ADD CONSTRAINT "variance_po_schedule_task_id_fkey" FOREIGN KEY ("schedule_task_id") REFERENCES "schedule_tasks"("schedule_task_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "variance_po" ADD CONSTRAINT "variance_po_sent_to_vendor_by_fkey" FOREIGN KEY ("sent_to_vendor_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_master" ADD CONSTRAINT "selection_sheet_master_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_master" ADD CONSTRAINT "selection_sheet_master_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_master" ADD CONSTRAINT "selection_sheet_master_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_master" ADD CONSTRAINT "selection_sheet_master_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_master" ADD CONSTRAINT "selection_sheet_master_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_page" ADD CONSTRAINT "selection_sheet_page_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_page" ADD CONSTRAINT "selection_sheet_page_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_page" ADD CONSTRAINT "selection_sheet_page_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_page" ADD CONSTRAINT "selection_sheet_page_selection_sheet_master_id_fkey" FOREIGN KEY ("selection_sheet_master_id") REFERENCES "selection_sheet_master"("selection_sheet_master_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_question" ADD CONSTRAINT "selection_sheet_question_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_question" ADD CONSTRAINT "selection_sheet_question_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_question" ADD CONSTRAINT "selection_sheet_question_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_question" ADD CONSTRAINT "selection_sheet_question_selection_sheet_section_id_fkey" FOREIGN KEY ("selection_sheet_section_id") REFERENCES "selection_sheet_section"("selection_sheet_section_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_response" ADD CONSTRAINT "selection_sheet_response_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_response" ADD CONSTRAINT "selection_sheet_response_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_response" ADD CONSTRAINT "selection_sheet_response_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_response" ADD CONSTRAINT "selection_sheet_response_selection_sheet_question_id_fkey" FOREIGN KEY ("selection_sheet_question_id") REFERENCES "selection_sheet_question"("selection_sheet_question_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_section" ADD CONSTRAINT "selection_sheet_section_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_section" ADD CONSTRAINT "selection_sheet_section_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_section" ADD CONSTRAINT "selection_sheet_section_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_section" ADD CONSTRAINT "selection_sheet_section_selection_sheet_page_id_fkey" FOREIGN KEY ("selection_sheet_page_id") REFERENCES "selection_sheet_page"("selection_sheet_page_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_question1" ADD CONSTRAINT "selection_sheet_sub_question1_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_question1" ADD CONSTRAINT "selection_sheet_sub_question1_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_question1" ADD CONSTRAINT "selection_sheet_sub_question1_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_question1" ADD CONSTRAINT "selection_sheet_sub_question1_selection_sheet_question_id_fkey" FOREIGN KEY ("selection_sheet_question_id") REFERENCES "selection_sheet_question"("selection_sheet_question_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_question2" ADD CONSTRAINT "selection_sheet_sub_question2_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_question2" ADD CONSTRAINT "selection_sheet_sub_question2_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_question2" ADD CONSTRAINT "selection_sheet_sub_question2_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_question2" ADD CONSTRAINT "selection_sheet_sub_question2_selection_sheet_sub_question_fkey" FOREIGN KEY ("selection_sheet_sub_question1_id") REFERENCES "selection_sheet_sub_question1"("selection_sheet_sub_question1_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_response1" ADD CONSTRAINT "selection_sheet_sub_response1_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_response1" ADD CONSTRAINT "selection_sheet_sub_response1_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_response1" ADD CONSTRAINT "selection_sheet_sub_response1_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_response1" ADD CONSTRAINT "selection_sheet_sub_response1_selection_sheet_response_id_fkey" FOREIGN KEY ("selection_sheet_response_id") REFERENCES "selection_sheet_response"("selection_sheet_response_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_response1" ADD CONSTRAINT "selection_sheet_sub_response1_selection_sheet_sub_question_fkey" FOREIGN KEY ("selection_sheet_sub_question1_id") REFERENCES "selection_sheet_sub_question1"("selection_sheet_sub_question1_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_response2" ADD CONSTRAINT "selection_sheet_sub_response2_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_response2" ADD CONSTRAINT "selection_sheet_sub_response2_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_response2" ADD CONSTRAINT "selection_sheet_sub_response2_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_response2" ADD CONSTRAINT "selection_sheet_sub_response2_selection_sheet_sub_question_fkey" FOREIGN KEY ("selection_sheet_sub_question2_id") REFERENCES "selection_sheet_sub_question2"("selection_sheet_sub_question2_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "selection_sheet_sub_response2" ADD CONSTRAINT "selection_sheet_sub_response2_selection_sheet_sub_response_fkey" FOREIGN KEY ("selection_sheet_sub_response1_id") REFERENCES "selection_sheet_sub_response1"("selection_sheet_sub_response1_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_assignments" ADD CONSTRAINT "supplier_bid_assignments_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_assignments" ADD CONSTRAINT "supplier_bid_assignments_builder_supplier_id_fkey" FOREIGN KEY ("builder_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_assignments" ADD CONSTRAINT "supplier_bid_assignments_supplier_bid_guid_fkey" FOREIGN KEY ("supplier_bid_guid") REFERENCES "supplier_bid_master"("supplier_bid_guid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_attachments" ADD CONSTRAINT "supplier_bid_attachments_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_attachments" ADD CONSTRAINT "supplier_bid_attachments_supplier_bid_assignment_guid_fkey" FOREIGN KEY ("supplier_bid_assignment_guid") REFERENCES "supplier_bid_assignments"("supplier_bid_assignment_guid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_attachments" ADD CONSTRAINT "supplier_bid_attachments_supplier_bid_guid_fkey" FOREIGN KEY ("supplier_bid_guid") REFERENCES "supplier_bid_master"("supplier_bid_guid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_attachments" ADD CONSTRAINT "supplier_bid_attachments_supplier_bid_pricing_guid_fkey" FOREIGN KEY ("supplier_bid_pricing_guid") REFERENCES "supplier_bid_pricing"("supplier_bid_pricing_guid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_master" ADD CONSTRAINT "supplier_bid_master_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_master" ADD CONSTRAINT "supplier_bid_master_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_master" ADD CONSTRAINT "supplier_bid_master_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_pricing" ADD CONSTRAINT "supplier_bid_pricing_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_pricing" ADD CONSTRAINT "supplier_bid_pricing_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_pricing" ADD CONSTRAINT "supplier_bid_pricing_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_bid_pricing" ADD CONSTRAINT "supplier_bid_pricing_supplier_bid_assignment_guid_fkey" FOREIGN KEY ("supplier_bid_assignment_guid") REFERENCES "supplier_bid_assignments"("supplier_bid_assignment_guid") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_contacts" ADD CONSTRAINT "supplier_contacts_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_contacts" ADD CONSTRAINT "supplier_contacts_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_costs" ADD CONSTRAINT "supplier_costs_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_costs" ADD CONSTRAINT "supplier_costs_builder_supplier_id_fkey" FOREIGN KEY ("builder_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_costs" ADD CONSTRAINT "supplier_costs_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_costs" ADD CONSTRAINT "supplier_costs_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_insurance" ADD CONSTRAINT "supplier_insurance_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_insurance" ADD CONSTRAINT "supplier_insurance_builders_supplier_id_fkey" FOREIGN KEY ("builders_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_insurance" ADD CONSTRAINT "supplier_insurance_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_insurance" ADD CONSTRAINT "supplier_insurance_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_po_group" ADD CONSTRAINT "supplier_po_group_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_po_group" ADD CONSTRAINT "supplier_po_group_builder_supplier_id_fkey" FOREIGN KEY ("builder_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_po_group" ADD CONSTRAINT "supplier_po_group_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_tax_groups" ADD CONSTRAINT "supplier_tax_groups_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_tax_groups" ADD CONSTRAINT "supplier_tax_groups_builders_supplier_id_fkey" FOREIGN KEY ("builders_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "supplier_tax_groups" ADD CONSTRAINT "supplier_tax_groups_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("ticket_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_attachments" ADD CONSTRAINT "ticket_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_categories" ADD CONSTRAINT "ticket_categories_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("ticket_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_history" ADD CONSTRAINT "ticket_history_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_history" ADD CONSTRAINT "ticket_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_history" ADD CONSTRAINT "ticket_history_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("ticket_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_priorities" ADD CONSTRAINT "ticket_priorities_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ticket_statuses" ADD CONSTRAINT "ticket_statuses_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ticket_categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_priority_id_fkey" FOREIGN KEY ("priority_id") REFERENCES "ticket_priorities"("priority_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_related_community_id_fkey" FOREIGN KEY ("related_community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_related_home_id_fkey" FOREIGN KEY ("related_home_id") REFERENCES "homes"("home_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_related_job_id_fkey" FOREIGN KEY ("related_job_id") REFERENCES "jobs"("job_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "ticket_statuses"("status_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_communities" ADD CONSTRAINT "user_communities_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_communities" ADD CONSTRAINT "user_communities_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_communities" ADD CONSTRAINT "user_communities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_default_regions" ADD CONSTRAINT "user_default_regions_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_default_regions" ADD CONSTRAINT "user_default_regions_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_default_regions" ADD CONSTRAINT "user_default_regions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_divisions" ADD CONSTRAINT "user_divisions_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_divisions" ADD CONSTRAINT "user_divisions_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "divisions"("division_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_divisions" ADD CONSTRAINT "user_divisions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_auth_group_id_fkey" FOREIGN KEY ("auth_group_id") REFERENCES "auth_groups"("auth_group_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_auth_permission_id_fkey" FOREIGN KEY ("auth_permission_id") REFERENCES "auth_permissions"("auth_permission_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_regions" ADD CONSTRAINT "user_regions_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_regions" ADD CONSTRAINT "user_regions_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_regions" ADD CONSTRAINT "user_regions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "user_roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_role_permissions" ADD CONSTRAINT "user_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "user_roles"("role_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_active_builder_id_fkey" FOREIGN KEY ("active_builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problem_po_indexes" ADD CONSTRAINT "warranty_problem_po_indexes_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problem_po_indexes" ADD CONSTRAINT "warranty_problem_po_indexes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problem_po_indexes" ADD CONSTRAINT "warranty_problem_po_indexes_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problem_po_indexes" ADD CONSTRAINT "warranty_problem_po_indexes_po_master_id_fkey" FOREIGN KEY ("po_master_id") REFERENCES "po_master"("po_master_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problem_po_indexes" ADD CONSTRAINT "warranty_problem_po_indexes_warranty_problem_id_fkey" FOREIGN KEY ("warranty_problem_id") REFERENCES "warranty_problems"("warranty_problem_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problems" ADD CONSTRAINT "warranty_problems_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problems" ADD CONSTRAINT "warranty_problems_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problems" ADD CONSTRAINT "warranty_problems_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("community_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problems" ADD CONSTRAINT "warranty_problems_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problems" ADD CONSTRAINT "warranty_problems_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problems" ADD CONSTRAINT "warranty_problems_home_id_fkey" FOREIGN KEY ("home_id") REFERENCES "homes"("home_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problems" ADD CONSTRAINT "warranty_problems_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("job_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problems" ADD CONSTRAINT "warranty_problems_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problems" ADD CONSTRAINT "warranty_problems_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("region_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_problems" ADD CONSTRAINT "warranty_problems_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_work_orders" ADD CONSTRAINT "warranty_work_orders_assigned_contact_id_fkey" FOREIGN KEY ("assigned_contact_id") REFERENCES "contacts"("contact_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_work_orders" ADD CONSTRAINT "warranty_work_orders_assigned_supplier_id_fkey" FOREIGN KEY ("assigned_supplier_id") REFERENCES "suppliers"("supplier_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_work_orders" ADD CONSTRAINT "warranty_work_orders_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("builder_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_work_orders" ADD CONSTRAINT "warranty_work_orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_work_orders" ADD CONSTRAINT "warranty_work_orders_modified_by_fkey" FOREIGN KEY ("modified_by") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "warranty_work_orders" ADD CONSTRAINT "warranty_work_orders_warranty_problem_id_fkey" FOREIGN KEY ("warranty_problem_id") REFERENCES "warranty_problems"("warranty_problem_id") ON DELETE CASCADE ON UPDATE NO ACTION;
