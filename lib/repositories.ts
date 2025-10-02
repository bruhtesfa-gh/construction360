// Type-safe SQL repository pattern for Construction360 database
import sql from './db';
import type {
  Builder, User, Region, Community, Job, FloorPlan, Home, Customer, Option, Supplier, SupplierContact,
  InventoryHome, Lender, Opportunity, Contact, EstimatingDBGroup, EstimatingDBItem, EstimatingDBItemsPOIndex,
  SupplierCost,
  CreateBuilder, CreateUser, CreateRegion, CreateCommunity, CreateJob,
  CreateFloorPlan, CreateHome, CreateCustomer, CreateOption, CreateSupplier, CreateSupplierContact,
  CreateInventoryHome, CreateLender, CreateOpportunity, CreateContact, CreateEstimatingDBGroup, CreateEstimatingDBItem, CreateEstimatingDBItemsPOIndex,
  CreateSupplierCost,
  UpdateBuilder, UpdateUser, UpdateRegion, UpdateCommunity, UpdateJob,
  UpdateFloorPlan, UpdateHome, UpdateCustomer, UpdateOption, UpdateSupplier, UpdateSupplierContact,
  UpdateInventoryHome, UpdateLender, UpdateOpportunity, UpdateContact, UpdateEstimatingDBGroup, UpdateEstimatingDBItem, UpdateEstimatingDBItemsPOIndex,
  UpdateSupplierCost
} from '../types/database';

// Set the current builder context for RLS
export async function setBuilderContext(builderId: string) {
  await sql`SELECT set_config('app.current_builder_id', ${builderId}, true)`;
}

// Builder Repository
export const builderRepository = {
  async findById(id: string): Promise<Builder | null> {
    const [builder] = await sql<Builder[]>`
      SELECT * FROM builders WHERE builder_id = ${id}
    `;
    return builder || null;
  },

  async findAll(): Promise<Builder[]> {
    return await sql<Builder[]>`
      SELECT * FROM builders ORDER BY created_at DESC
    `;
  },

  async create(data: CreateBuilder): Promise<Builder> {
    const [builder] = await sql<Builder[]>`
      INSERT INTO builders ${sql(data)}
      RETURNING *
    `;
    return builder;
  },

  async update(data: UpdateBuilder): Promise<Builder> {
    const { builder_id, ...updates } = data;
    const [builder] = await sql<Builder[]>`
      UPDATE builders 
      SET ${sql(updates)}
      WHERE builder_id = ${builder_id}
      RETURNING *
    `;
    return builder;
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM builders WHERE builder_id = ${id}`;
  }
};

// User Repository
export const userRepository = {
  async findById(id: string): Promise<User | null> {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE user_id = ${id}
    `;
    return user || null;
  },

  async findByLogin(loginId: string): Promise<User | null> {
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE user_login_id = ${loginId}
    `;
    return user || null;
  },

  async findByBuilder(builderId: string, limit?: number, offset?: number): Promise<User[]> {
    if (limit !== undefined && offset !== undefined) {
      return await sql<User[]>`
        SELECT * FROM users 
        WHERE builder_id = ${builderId}
        ORDER BY first_name, last_name
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql<User[]>`
      SELECT * FROM users 
      WHERE builder_id = ${builderId}
      ORDER BY first_name, last_name
    `;
  },

  async create(data: CreateUser): Promise<User> {
    const [user] = await sql<User[]>`
      INSERT INTO users ${sql(data)}
      RETURNING *
    `;
    return user;
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await sql<User[]>`
      UPDATE users 
      SET ${sql(updates)}
      WHERE user_id = ${id}
      RETURNING *
    `;
    return user;
  },

  async delete(id: string): Promise<void> {
    await sql`UPDATE users SET inactive = true WHERE user_id = ${id}`;
  },

  async updatePasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await sql`
      UPDATE users 
      SET password_reset_token = ${token}, 
          password_reset_expires = ${expires}
      WHERE user_id = ${userId}
    `;
  },

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const [user] = await sql<User[]>`
      SELECT * FROM users 
      WHERE password_reset_token = ${token}
        AND password_reset_expires > NOW()
    `;
    return user || null;
  },

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await sql`
      UPDATE users 
      SET password_hash = ${Buffer.from(hashedPassword)}
      WHERE user_id = ${userId}
    `;
  },

  async clearPasswordResetToken(userId: string): Promise<void> {
    await sql`
      UPDATE users 
      SET password_reset_token = NULL, 
          password_reset_expires = NULL
      WHERE user_id = ${userId}
    `;
  }
};

// Region Repository
export const regionRepository = {
  async findById(id: string): Promise<Region | null> {
    const [region] = await sql<Region[]>`
      SELECT * FROM regions WHERE region_id = ${id}
    `;
    return region || null;
  },

  async findByBuilder(builderId: string, limit?: number, offset?: number): Promise<Region[]> {
    if (limit !== undefined && offset !== undefined) {
      return await sql<Region[]>`
        SELECT * FROM regions 
        WHERE builder_id = ${builderId}
        ORDER BY region_code
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql<Region[]>`
      SELECT * FROM regions 
      WHERE builder_id = ${builderId}
      ORDER BY region_code
    `;
  },

  async create(data: CreateRegion): Promise<Region> {
    const [region] = await sql<Region[]>`
      INSERT INTO regions ${sql(data)}
      RETURNING *
    `;
    return region;
  },

  async update(id: string, updates: Partial<Region>): Promise<Region> {
    const [region] = await sql<Region[]>`
      UPDATE regions 
      SET ${sql(updates)}
      WHERE region_id = ${id}
      RETURNING *
    `;
    return region;
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM regions WHERE region_id = ${id}`;
  }
};

// Community Repository
export const communityRepository = {
  async findById(id: string): Promise<Community | null> {
    const [community] = await sql<Community[]>`
      SELECT * FROM communities WHERE community_id = ${id}
    `;
    return community || null;
  },

  async findByRegion(regionId: string): Promise<Community[]> {
    return await sql<Community[]>`
      SELECT * FROM communities 
      WHERE region_id = ${regionId} AND is_inactive = false
      ORDER BY community_code
    `;
  },

  async findByBuilder(builderId: string): Promise<Community[]> {
    return await sql<Community[]>`
      SELECT c.*, r.region_code 
      FROM communities c
      JOIN regions r ON c.region_id = r.region_id
      WHERE c.builder_id = ${builderId} AND c.is_inactive = false
      ORDER BY r.region_code, c.community_code
    `;
  },

  async create(data: CreateCommunity): Promise<Community> {
    const [community] = await sql<Community[]>`
      INSERT INTO communities ${sql(data)}
      RETURNING *
    `;
    return community;
  },

  async update(data: UpdateCommunity): Promise<Community> {
    const { community_id, ...updates } = data;
    const [community] = await sql<Community[]>`
      UPDATE communities 
      SET ${sql(updates)}
      WHERE community_id = ${community_id}
      RETURNING *
    `;
    return community;
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM communities WHERE community_id = ${id}`;
  }
};

// Job Repository
export const jobRepository = {
  async findById(id: string): Promise<Job | null> {
    const [job] = await sql<Job[]>`
      SELECT * FROM jobs WHERE job_id = ${id}
    `;
    return job || null;
  },

  async findByJobNumber(regionId: string, jobNumber: string): Promise<Job | null> {
    const [job] = await sql<Job[]>`
      SELECT * FROM jobs 
      WHERE region_id = ${regionId} AND job_number = ${jobNumber}
    `;
    return job || null;
  },

  async findByCommunity(communityId: string): Promise<Job[]> {
    return await sql<Job[]>`
      SELECT j.*, c.community_code, r.region_code
      FROM jobs j
      JOIN communities c ON j.community_id = c.community_id
      JOIN regions r ON j.region_id = r.region_id
      WHERE j.community_id = ${communityId}
      ORDER BY j.created_at DESC
    `;
  },

  async findByBuilder(builderId: string, limit: number = 50): Promise<Job[]> {
    return await sql<Job[]>`
      SELECT j.*, c.community_code, r.region_code
      FROM jobs j
      LEFT JOIN communities c ON j.community_id = c.community_id
      JOIN regions r ON j.region_id = r.region_id
      WHERE j.builder_id = ${builderId}
      ORDER BY j.created_at DESC
      LIMIT ${limit}
    `;
  },

  async create(data: CreateJob): Promise<Job> {
    const [job] = await sql<Job[]>`
      INSERT INTO jobs ${sql(data)}
      RETURNING *
    `;
    return job;
  },

  async update(data: UpdateJob): Promise<Job> {
    const { job_id, ...updates } = data;
    const [job] = await sql<Job[]>`
      UPDATE jobs 
      SET ${sql(updates)}
      WHERE job_id = ${job_id}
      RETURNING *
    `;
    return job;
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM jobs WHERE job_id = ${id}`;
  }
};

// Home Repository
export const homeRepository = {
  async findById(id: string): Promise<Home | null> {
    const [home] = await sql<Home[]>`
      SELECT * FROM homes WHERE home_id = ${id}
    `;
    return home || null;
  },

  async findByCommunity(communityId: string): Promise<Home[]> {
    return await sql<Home[]>`
      SELECT h.*, fp.floor_plan_code, fp.description as floor_plan_description
      FROM homes h
      LEFT JOIN floor_plan_communities fp ON h.floor_plan_id = fp.floor_plan_id
      WHERE h.community_id = ${communityId}
      ORDER BY h.sequence
    `;
  },

  async findByBuilder(builderId: string, limit: number = 50): Promise<Home[]> {
    return await sql<Home[]>`
      SELECT h.*, c.community_code, r.region_code
      FROM homes h
      JOIN communities c ON h.community_id = c.community_id
      JOIN regions r ON h.region_id = r.region_id
      WHERE h.builder_id = ${builderId}
      ORDER BY h.created_at DESC
      LIMIT ${limit}
    `;
  },

  async create(data: CreateHome): Promise<Home> {
    const [home] = await sql<Home[]>`
      INSERT INTO homes ${sql(data)}
      RETURNING *
    `;
    return home;
  },

  async update(data: UpdateHome): Promise<Home> {
    const { home_id, ...updates } = data;
    const [home] = await sql<Home[]>`
      UPDATE homes 
      SET ${sql(updates)}
      WHERE home_id = ${home_id}
      RETURNING *
    `;
    return home;
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM homes WHERE home_id = ${id}`;
  }
};

// Customer Repository
export const customerRepository = {
  async findById(regionId: string, customerId: string): Promise<Customer | null> {
    const [customer] = await sql<Customer[]>`
      SELECT * FROM customers 
      WHERE region_id = ${regionId} AND customer_id = ${customerId}
    `;
    return customer || null;
  },

  async findByBuilder(builderId: string): Promise<Customer[]> {
    return await sql<Customer[]>`
      SELECT c.*, r.region_code
      FROM customers c
      JOIN regions r ON c.region_id = r.region_id
      WHERE c.builder_id = ${builderId} AND (c.inactive IS NULL OR c.inactive = false)
      ORDER BY c.customer_name
    `;
  },

  async searchByName(builderId: string, name: string): Promise<Customer[]> {
    return await sql<Customer[]>`
      SELECT c.*, r.region_code
      FROM customers c
      JOIN regions r ON c.region_id = r.region_id
      WHERE c.builder_id = ${builderId} 
        AND (c.inactive IS NULL OR c.inactive = false)
        AND c.customer_name ILIKE ${`%${name}%`}
      ORDER BY c.customer_name
      LIMIT 20
    `;
  },

  async create(data: CreateCustomer): Promise<Customer> {
    const [customer] = await sql<Customer[]>`
      INSERT INTO customers ${sql(data)}
      RETURNING *
    `;
    return customer;
  },

  async update(data: UpdateCustomer): Promise<Customer> {
    const { customer_id, ...updates } = data;
    const [customer] = await sql<Customer[]>`
      UPDATE customers 
      SET ${sql(updates)}
      WHERE customer_id = ${customer_id}
      RETURNING *
    `;
    return customer;
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM customers WHERE customer_id = ${id}`;
  }
};

// Floor Plan Repository
export const floorPlanRepository = {
  async findById(id: string): Promise<FloorPlan | null> {
    const [floorPlan] = await sql<FloorPlan[]>`
      SELECT * FROM floor_plan_communities WHERE floor_plan_id = ${id}
    `;
    return floorPlan || null;
  },

  async findByCommunity(communityId: string): Promise<FloorPlan[]> {
    return await sql<FloorPlan[]>`
      SELECT * FROM floor_plan_communities 
      WHERE community_id = ${communityId} 
        AND inactive = false 
        AND (is_deleted IS NULL OR is_deleted = false)
      ORDER BY series, floor_plan_code
    `;
  },

  async findByBuilder(builderId: string, communityId?: string, limit?: number, offset?: number): Promise<FloorPlan[]> {
    if (communityId) {
      if (limit !== undefined && offset !== undefined) {
        return await sql<FloorPlan[]>`
          SELECT fp.*, c.community_code, c.description as community_name
          FROM floor_plan_communities fp
          JOIN communities c ON fp.community_id = c.community_id
          WHERE fp.builder_id = ${builderId} 
            AND fp.community_id = ${communityId}
            AND fp.inactive = false 
            AND (fp.is_deleted IS NULL OR fp.is_deleted = false)
          ORDER BY fp.series, fp.floor_plan_code
          LIMIT ${limit} OFFSET ${offset}
        `;
      }
      return await sql<FloorPlan[]>`
        SELECT fp.*, c.community_code, c.description as community_name
        FROM floor_plan_communities fp
        JOIN communities c ON fp.community_id = c.community_id
        WHERE fp.builder_id = ${builderId} 
          AND fp.community_id = ${communityId}
          AND fp.inactive = false 
          AND (fp.is_deleted IS NULL OR fp.is_deleted = false)
        ORDER BY fp.series, fp.floor_plan_code
      `;
    }
    
    if (limit !== undefined && offset !== undefined) {
      return await sql<FloorPlan[]>`
        SELECT fp.*, c.community_code, c.description as community_name
        FROM floor_plan_communities fp
        JOIN communities c ON fp.community_id = c.community_id
        WHERE fp.builder_id = ${builderId} 
          AND fp.inactive = false 
          AND (fp.is_deleted IS NULL OR fp.is_deleted = false)
        ORDER BY c.community_code, fp.series, fp.floor_plan_code
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql<FloorPlan[]>`
      SELECT fp.*, c.community_code, c.description as community_name
      FROM floor_plan_communities fp
      JOIN communities c ON fp.community_id = c.community_id
      WHERE fp.builder_id = ${builderId} 
        AND fp.inactive = false 
        AND (fp.is_deleted IS NULL OR fp.is_deleted = false)
      ORDER BY c.community_code, fp.series, fp.floor_plan_code
    `;
  },

  async create(data: CreateFloorPlan): Promise<FloorPlan> {
    const [floorPlan] = await sql<FloorPlan[]>`
      INSERT INTO floor_plan_communities ${sql(data)}
      RETURNING *
    `;
    return floorPlan;
  },

  async update(id: string, updates: Partial<FloorPlan>): Promise<FloorPlan> {
    const [floorPlan] = await sql<FloorPlan[]>`
      UPDATE floor_plan_communities 
      SET ${sql(updates)}
      WHERE floor_plan_id = ${id}
      RETURNING *
    `;
    return floorPlan;
  }
};

// Option Repository
export const optionRepository = {
  async findById(id: string): Promise<Option | null> {
    const [option] = await sql<Option[]>`
      SELECT * FROM options WHERE option_id = ${id}
    `;
    return option || null;
  },

  async findByCommunity(communityId: string): Promise<Option[]> {
    return await sql<Option[]>`
      SELECT * FROM options 
      WHERE community_id = ${communityId} 
        AND inactive = false 
        AND (is_deleted IS NULL OR is_deleted = false)
      ORDER BY category_code, sub_category_code, option_code
    `;
  },

  async findByFloorPlan(communityId: string, floorPlanCode: string, elevationCode: string): Promise<Option[]> {
    return await sql<Option[]>`
      SELECT * FROM options 
      WHERE community_id = ${communityId}
        AND floor_plan_code = ${floorPlanCode}
        AND elevation_code = ${elevationCode}
        AND inactive = false 
        AND (is_deleted IS NULL OR is_deleted = false)
      ORDER BY category_code, sub_category_code, option_code
    `;
  },

  async create(data: CreateOption): Promise<Option> {
    const [option] = await sql<Option[]>`
      INSERT INTO options ${sql(data)}
      RETURNING *
    `;
    return option;
  },

  async update(data: UpdateOption): Promise<Option> {
    const { option_id, ...updates } = data;
    const [option] = await sql<Option[]>`
      UPDATE options 
      SET ${sql(updates)}
      WHERE option_id = ${option_id}
      RETURNING *
    `;
    return option;
  }
};

// Supplier Repository
export const supplierRepository = {
  async findById(id: string): Promise<Supplier | null> {
    const [supplier] = await sql<Supplier[]>`
      SELECT * FROM suppliers WHERE supplier_id = ${id}
    `;
    return supplier || null;
  },

  async findByCode(builderId: string, supplierCode: string): Promise<Supplier | null> {
    const [supplier] = await sql<Supplier[]>`
      SELECT * FROM suppliers 
      WHERE builder_id = ${builderId} AND supplier_code = ${supplierCode}
    `;
    return supplier || null;
  },

  async findByBuilder(builderId: string, limit?: number, offset?: number): Promise<Supplier[]> {
    if (limit !== undefined && offset !== undefined) {
      return await sql<Supplier[]>`
        SELECT * FROM suppliers 
        WHERE builder_id = ${builderId}
        ORDER BY supplier_name, supplier_code
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql<Supplier[]>`
      SELECT * FROM suppliers 
      WHERE builder_id = ${builderId}
      ORDER BY supplier_name, supplier_code
    `;
  },

  async findActiveByBuilder(builderId: string): Promise<Supplier[]> {
    return await sql<Supplier[]>`
      SELECT * FROM suppliers 
      WHERE builder_id = ${builderId} AND (is_inactive IS NULL OR is_inactive = false)
      ORDER BY supplier_name
    `;
  },

  async searchByName(builderId: string, name: string): Promise<Supplier[]> {
    return await sql<Supplier[]>`
      SELECT * FROM suppliers
      WHERE builder_id = ${builderId} 
        AND supplier_name ILIKE ${`%${name}%`}
      ORDER BY supplier_name
      LIMIT 20
    `;
  },

  async create(data: CreateSupplier): Promise<Supplier> {
    const [supplier] = await sql<Supplier[]>`
      INSERT INTO suppliers ${sql(data)}
      RETURNING *
    `;
    return supplier;
  },

  async update(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    const [supplier] = await sql<Supplier[]>`
      UPDATE suppliers 
      SET ${sql(updates)}
      WHERE supplier_id = ${id}
      RETURNING *
    `;
    return supplier;
  },

  async delete(id: string): Promise<void> {
    await sql`UPDATE suppliers SET is_inactive = true WHERE supplier_id = ${id}`;
  }
};

// Supplier Contact Repository
export const supplierContactRepository = {
  async findById(id: string): Promise<SupplierContact | null> {
    const [contact] = await sql<SupplierContact[]>`
      SELECT * FROM supplier_contacts WHERE supplier_contact_id = ${id}
    `;
    return contact || null;
  },

  async findBySupplier(supplierId: string): Promise<SupplierContact[]> {
    return await sql<SupplierContact[]>`
      SELECT * FROM supplier_contacts 
      WHERE supplier_id = ${supplierId} AND (is_inactive IS NULL OR is_inactive = false)
      ORDER BY supplier_contact_name
    `;
  },

  async findAllBySupplier(supplierId: string): Promise<SupplierContact[]> {
    return await sql<SupplierContact[]>`
      SELECT * FROM supplier_contacts 
      WHERE supplier_id = ${supplierId}
      ORDER BY supplier_contact_name
    `;
  },

  async create(data: CreateSupplierContact): Promise<SupplierContact> {
    const [contact] = await sql<SupplierContact[]>`
      INSERT INTO supplier_contacts ${sql(data)}
      RETURNING *
    `;
    return contact;
  },

  async update(id: string, updates: Partial<SupplierContact>): Promise<SupplierContact> {
    const [contact] = await sql<SupplierContact[]>`
      UPDATE supplier_contacts 
      SET ${sql(updates)}
      WHERE supplier_contact_id = ${id}
      RETURNING *
    `;
    return contact;
  },

  async delete(id: string): Promise<void> {
    await sql`UPDATE supplier_contacts SET is_inactive = true WHERE supplier_contact_id = ${id}`;
  },

  async findAllByBuilder(builderId: string): Promise<Record<string, SupplierContact[]>> {
    const contacts = await sql<SupplierContact[]>`
      SELECT sc.* 
      FROM supplier_contacts sc
      JOIN supplier s ON sc.supplier_id = s.supplier_id
      WHERE s.builder_id = ${builderId} 
        AND (sc.is_inactive IS NULL OR sc.is_inactive = false)
        AND (s.is_inactive IS NULL OR s.is_inactive = false)
      ORDER BY s.supplier_name, sc.supplier_contact_name
    `;
    
    // Group contacts by supplier_id
    const contactsBySupplier: Record<string, SupplierContact[]> = {};
    for (const contact of contacts) {
      if (!contactsBySupplier[contact.supplier_id]) {
        contactsBySupplier[contact.supplier_id] = [];
      }
      contactsBySupplier[contact.supplier_id].push(contact);
    }
    
    return contactsBySupplier;
  }
};

// Lot Inventory Repository
export const lotInventoryRepository = {
  async findById(id: string): Promise<InventoryHome | null> {
    const [lot] = await sql<InventoryHome[]>`
      SELECT * FROM lots WHERE lot_id = ${id}
    `;
    return lot || null;
  },

  async findByBuilder(builderId: string, limit?: number, offset?: number): Promise<InventoryHome[]> {
    if (limit !== undefined && offset !== undefined) {
      return await sql<InventoryHome[]>`
        SELECT li.*, c.description as community_name, c.community_code
        FROM lots li
        JOIN communities c ON li.community_id = c.community_id
        WHERE li.builder_id = ${builderId}
          AND (li.inactive IS NULL OR li.inactive = false)
        ORDER BY c.community_code, li.lot_number
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql<InventoryHome[]>`
      SELECT li.*, c.description as community_name, c.community_code
      FROM lots li
      JOIN communities c ON li.community_id = c.community_id
      WHERE li.builder_id = ${builderId}
        AND (li.inactive IS NULL OR li.inactive = false)
      ORDER BY c.community_code, li.lot_number
    `;
  },

  async findByCommunity(communityId: string): Promise<InventoryHome[]> {
    return await sql<InventoryHome[]>`
      SELECT * FROM lots 
      WHERE community_id = ${communityId}
        AND (inactive IS NULL OR inactive = false)
      ORDER BY lot_number
    `;
  },

  async create(data: CreateInventoryHome): Promise<InventoryHome> {
    const [lot] = await sql<InventoryHome[]>`
      INSERT INTO lots ${sql(data)}
      RETURNING *
    `;
    return lot;
  },

  async update(id: string, updates: Partial<InventoryHome>): Promise<InventoryHome> {
    const [lot] = await sql<InventoryHome[]>`
      UPDATE lots 
      SET ${sql(updates)}
      WHERE lot_id = ${id}
      RETURNING *
    `;
    return lot;
  },

  async delete(id: string): Promise<void> {
    await sql`UPDATE lots SET inactive = true, inactive_date = NOW() WHERE lot_id = ${id}`;
  }
};

// Lender Repository
export const lenderRepository = {
  async findById(id: string): Promise<Lender | null> {
    const [lender] = await sql<Lender[]>`
      SELECT * FROM lenders WHERE lender_id = ${id}
    `;
    return lender || null;
  },

  async findByBuilder(builderId: string, limit?: number, offset?: number): Promise<Lender[]> {
    if (limit !== undefined && offset !== undefined) {
      return await sql<Lender[]>`
        SELECT l.*, r.region_code, r.description as region_name
        FROM lenders l
        JOIN regions r ON l.region_id = r.region_id
        WHERE l.builder_id = ${builderId}
          AND (l.inactive IS NULL OR l.inactive = false)
        ORDER BY l.lender_name
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql<Lender[]>`
      SELECT l.*, r.region_code, r.description as region_name
      FROM lenders l
      JOIN region r ON l.region_id = r.region_id
      WHERE l.builder_id = ${builderId}
        AND (l.inactive IS NULL OR l.inactive = false)
      ORDER BY l.lender_name
    `;
  },

  async findByRegion(regionId: string): Promise<Lender[]> {
    return await sql<Lender[]>`
      SELECT * FROM lenders 
      WHERE region_id = ${regionId}
        AND (inactive IS NULL OR inactive = false)
      ORDER BY lender_name
    `;
  },

  async create(data: CreateLender): Promise<Lender> {
    const [lender] = await sql<Lender[]>`
      INSERT INTO lender ${sql(data)}
      RETURNING *
    `;
    return lender;
  },

  async update(id: string, updates: Partial<Lender>): Promise<Lender> {
    const [lender] = await sql<Lender[]>`
      UPDATE lender 
      SET ${sql(updates)}
      WHERE lender_id = ${id}
      RETURNING *
    `;
    return lender;
  },

  async delete(id: string): Promise<void> {
    await sql`UPDATE lender SET inactive = true WHERE lender_id = ${id}`;
  }
};

// Contact Repository
export const contactRepository = {
  async findById(id: string): Promise<Contact | null> {
    const [contact] = await sql<Contact[]>`
      SELECT * FROM contacts WHERE contact_id = ${id}
    `;
    return contact || null;
  },

  async findByBuilder(builderId: string, limit?: number, offset?: number): Promise<Contact[]> {
    if (limit !== undefined && offset !== undefined) {
      return await sql<Contact[]>`
        SELECT *
        FROM contacts
        WHERE builder_id = ${builderId}
          AND is_active = true
        ORDER BY last_name, first_name
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql<Contact[]>`
      SELECT *
      FROM contacts
      WHERE builder_id = ${builderId}
        AND is_active = true
      ORDER BY last_name, first_name
    `;
  },

  async searchByName(builderId: string, searchTerm: string): Promise<Contact[]> {
    return await sql<Contact[]>`
      SELECT * FROM contacts
      WHERE builder_id = ${builderId}
        AND is_active = true
        AND (
          first_name ILIKE ${`%${searchTerm}%`} OR
          last_name ILIKE ${`%${searchTerm}%`} OR
          company_name ILIKE ${`%${searchTerm}%`} OR
          email ILIKE ${`%${searchTerm}%`}
        )
      ORDER BY last_name, first_name
      LIMIT 20
    `;
  },

  async create(data: CreateContact): Promise<Contact> {
    const [contact] = await sql<Contact[]>`
      INSERT INTO contact ${sql(data)}
      RETURNING *
    `;
    return contact;
  },

  async update(id: string, updates: Partial<Contact>): Promise<Contact> {
    const [contact] = await sql<Contact[]>`
      UPDATE contact 
      SET ${sql(updates)}
      WHERE contact_id = ${id}
      RETURNING *
    `;
    return contact;
  },

  async delete(id: string): Promise<void> {
    await sql`UPDATE contact SET is_active = false WHERE contact_id = ${id}`;
  }
};

// Opportunity Repository
export const opportunityRepository = {
  async findById(id: string): Promise<Opportunity | null> {
    const [opportunity] = await sql<Opportunity[]>`
      SELECT * FROM opportunities WHERE opportunity_id = ${id}
    `;
    return opportunity || null;
  },

  async findByBuilder(builderId: string, limit?: number, offset?: number): Promise<Opportunity[]> {
    if (limit !== undefined && offset !== undefined) {
      return await sql<Opportunity[]>`
        SELECT o.*, 
          c.display_name as contact_name,
          cm.description as community_name,
          cm.community_code,
          u.first_name || ' ' || u.last_name as sales_person_name
        FROM opportunities o
        JOIN contacts c ON o.contact_id = c.contact_id
        LEFT JOIN communities cm ON o.community_id = cm.community_id
        LEFT JOIN "user" u ON o.sales_person_id = u.user_id
        WHERE o.builder_id = ${builderId}
        ORDER BY o.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql<Opportunity[]>`
      SELECT o.*, 
        c.display_name as contact_name,
        cm.description as community_name,
        cm.community_code,
        u.first_name || ' ' || u.last_name as sales_person_name
      FROM opportunities o
      JOIN contacts c ON o.contact_id = c.contact_id
      LEFT JOIN communities cm ON o.community_id = cm.community_id
      LEFT JOIN "user" u ON o.sales_person_id = u.user_id
      WHERE o.builder_id = ${builderId}
      ORDER BY o.created_at DESC
    `;
  },

  async findByContact(contactId: string): Promise<Opportunity[]> {
    return await sql<Opportunity[]>`
      SELECT * FROM opportunities 
      WHERE contact_id = ${contactId}
      ORDER BY created_at DESC
    `;
  },

  async create(data: CreateOpportunity): Promise<Opportunity> {
    const [opportunity] = await sql<Opportunity[]>`
      INSERT INTO opportunities ${sql(data)}
      RETURNING *
    `;
    return opportunity;
  },

  async update(id: string, updates: Partial<Opportunity>): Promise<Opportunity> {
    const [opportunity] = await sql<Opportunity[]>`
      UPDATE opportunities 
      SET ${sql(updates)}
      WHERE opportunity_id = ${id}
      RETURNING *
    `;
    return opportunity;
  },

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM opportunities WHERE opportunity_id = ${id}`;
  }
};

// EstimatingDBGroup Repository
export const estimatingDBGroupRepository = {
  async findAll(builderId: string): Promise<EstimatingDBGroup[]> {
    return await sql<EstimatingDBGroup[]>`
      SELECT * FROM estimating_db_groups 
      WHERE builder_id = ${builderId} AND (is_deleted IS NULL OR is_deleted = false)
      ORDER BY estimating_db_group
    `;
  },

  async findById(id: number): Promise<EstimatingDBGroup | null> {
    const [group] = await sql<EstimatingDBGroup[]>`
      SELECT * FROM estimating_db_groups WHERE estimating_db_group_id = ${id}
    `;
    return group || null;
  },

  async findByBuilder(builderId: string): Promise<EstimatingDBGroup[]> {
    return await sql<EstimatingDBGroup[]>`
      SELECT * FROM estimating_db_groups 
      WHERE builder_id = ${builderId} AND (is_deleted IS NULL OR is_deleted = false)
      ORDER BY estimating_db_group
    `;
  },

  async create(data: CreateEstimatingDBGroup): Promise<EstimatingDBGroup> {
    const [group] = await sql<EstimatingDBGroup[]>`
      INSERT INTO estimating_db_groups ${sql(data)}
      RETURNING *
    `;
    return group;
  },

  async update(data: UpdateEstimatingDBGroup): Promise<EstimatingDBGroup> {
    const { estimating_db_group_id, ...updates } = data;
    const [group] = await sql<EstimatingDBGroup[]>`
      UPDATE estimating_db_groups 
      SET ${sql(updates)}
      WHERE estimating_db_group_id = ${estimating_db_group_id}
      RETURNING *
    `;
    return group;
  },

  async delete(id: number): Promise<void> {
    await sql`
      UPDATE estimating_db_groups 
      SET is_deleted = true, deleted_date = NOW(), modified_date = NOW() 
      WHERE estimating_db_group_id = ${id}
    `;
  }
};

// EstimatingDBItem Repository
export const estimatingDBItemRepository = {
  async findAll(builderId: string): Promise<EstimatingDBItem[]> {
    return await sql<EstimatingDBItem[]>`
      SELECT * FROM estimating_db_items 
      WHERE builder_id = ${builderId} AND (inactive IS NULL OR inactive = false)
      ORDER BY estimating_db_item_code
    `;
  },

  async findById(id: string): Promise<EstimatingDBItem | null> {
    const [item] = await sql<EstimatingDBItem[]>`
      SELECT * FROM estimating_db_items WHERE estimating_db_item_id = ${id}
    `;
    return item || null;
  },

  async findByBuilder(builderId: string): Promise<EstimatingDBItem[]> {
    return await sql<EstimatingDBItem[]>`
      SELECT * FROM estimating_db_items 
      WHERE builder_id = ${builderId} AND (inactive IS NULL OR inactive = false)
      ORDER BY estimating_db_item_code
    `;
  },

  async findByGroup(builderId: string, groupCode: string): Promise<EstimatingDBItem[]> {
    return await sql<EstimatingDBItem[]>`
      SELECT * FROM estimating_db_items 
      WHERE builder_id = ${builderId} 
        AND estimating_db_group = ${groupCode}
        AND (inactive IS NULL OR inactive = false)
      ORDER BY estimating_db_item_code
    `;
  },

  async create(data: CreateEstimatingDBItem): Promise<EstimatingDBItem> {
    const [item] = await sql<EstimatingDBItem[]>`
      INSERT INTO estimating_db_items ${sql(data)}
      RETURNING *
    `;
    return item;
  },

  async update(data: UpdateEstimatingDBItem): Promise<EstimatingDBItem> {
    const { estimating_db_item_id, ...updates } = data;
    const [item] = await sql<EstimatingDBItem[]>`
      UPDATE estimating_db_items 
      SET ${sql(updates)}
      WHERE estimating_db_item_id = ${estimating_db_item_id}
      RETURNING *
    `;
    return item;
  },

  async delete(id: string): Promise<void> {
    await sql`
      UPDATE estimating_db_items 
      SET inactive = true 
      WHERE estimating_db_item_id = ${id}
    `;
  }
};

// EstimatingDBItemsPOIndex Repository
export const estimatingDBItemsPOIndexRepository = {
  async findAll(builderId: string): Promise<EstimatingDBItemsPOIndex[]> {
    return await sql<EstimatingDBItemsPOIndex[]>`
      SELECT * FROM estimating_db_items_po_index 
      WHERE builder_id = ${builderId}
      ORDER BY po_index
    `;
  },

  async findById(id: number): Promise<EstimatingDBItemsPOIndex | null> {
    const [index] = await sql<EstimatingDBItemsPOIndex[]>`
      SELECT * FROM estimating_db_items_po_index WHERE items_po_index_id = ${id}
    `;
    return index || null;
  },

  async findByBuilder(builderId: string): Promise<EstimatingDBItemsPOIndex[]> {
    return await sql<EstimatingDBItemsPOIndex[]>`
      SELECT * FROM estimating_db_items_po_index 
      WHERE builder_id = ${builderId}
      ORDER BY po_index
    `;
  },

  async findByItemId(builderId: string, itemId: string): Promise<EstimatingDBItemsPOIndex[]> {
    return await sql<EstimatingDBItemsPOIndex[]>`
      SELECT * FROM estimating_db_items_po_index 
      WHERE builder_id = ${builderId} AND estimating_db_item_id = ${itemId}
      ORDER BY po_index
    `;
  },

  async create(data: CreateEstimatingDBItemsPOIndex): Promise<EstimatingDBItemsPOIndex> {
    const [index] = await sql<EstimatingDBItemsPOIndex[]>`
      INSERT INTO estimating_db_items_po_index ${sql(data)}
      RETURNING *
    `;
    return index;
  },

  async update(data: UpdateEstimatingDBItemsPOIndex): Promise<EstimatingDBItemsPOIndex> {
    const { items_po_index_id, ...updates } = data;
    const [index] = await sql<EstimatingDBItemsPOIndex[]>`
      UPDATE estimating_db_items_po_index 
      SET ${sql(updates)}
      WHERE items_po_index_id = ${items_po_index_id}
      RETURNING *
    `;
    return index;
  },

  async delete(id: number): Promise<void> {
    await sql`DELETE FROM estimating_db_items_po_index WHERE items_po_index_id = ${id}`;
  }
};

// Supplier Cost Repository
export const supplierCostRepository = {
  async findById(id: string): Promise<SupplierCost | null> {
    const [cost] = await sql<SupplierCost[]>`
      SELECT * FROM supplier_costs WHERE supplier_cost_id = ${id}
    `;
    return cost || null;
  },

  async findByBuilder(builderId: string, limit?: number, offset?: number): Promise<SupplierCost[]> {
    if (limit !== undefined && offset !== undefined) {
      return await sql<SupplierCost[]>`
        SELECT sc.*
        FROM supplier_costs sc
        WHERE sc.builder_id = ${builderId} AND sc.is_active = true
        ORDER BY sc.created_date DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }
    return await sql<SupplierCost[]>`
      SELECT sc.*
      FROM supplier_costs sc
      WHERE sc.builder_id = ${builderId} AND sc.is_active = true
      ORDER BY sc.created_date DESC
    `;
  },

  async findBySupplierAndItem(builderId: string, supplierId: string, itemId: string, regionId?: string, communityId?: string): Promise<SupplierCost[]> {
    let whereClause = sql`
      WHERE builder_id = ${builderId} 
        AND builder_supplier_id = ${supplierId}
        AND estimating_db_item_id = ${itemId}
        AND is_active = true
    `;

    if (regionId) {
      whereClause = sql`
        WHERE builder_id = ${builderId} 
          AND builder_supplier_id = ${supplierId}
          AND estimating_db_item_id = ${itemId}
          AND region_id = ${regionId}
          AND is_active = true
      `;
    }

    if (communityId && regionId) {
      whereClause = sql`
        WHERE builder_id = ${builderId} 
          AND builder_supplier_id = ${supplierId}
          AND estimating_db_item_id = ${itemId}
          AND region_id = ${regionId}
          AND community_id = ${communityId}
          AND is_active = true
      `;
    }

    const results = await sql<SupplierCost[]>`
      SELECT * FROM supplier_costs ${whereClause}
    `;
    
    return results.sort((a, b) => new Date(b.effective_date || '').getTime() - new Date(a.effective_date || '').getTime());
  },

  async findCostHistory(builderId: string, supplierId: string, itemId: string): Promise<SupplierCost[]> {
    return await sql<SupplierCost[]>`
      SELECT sc.*, s.supplier_name, s.supplier_code
      FROM supplier_costs sc
      JOIN supplier s ON sc.builder_supplier_id = s.supplier_id
      WHERE sc.builder_id = ${builderId} 
        AND sc.builder_supplier_id = ${supplierId}
        AND sc.estimating_db_item_id = ${itemId}
      ORDER BY sc.effective_date DESC, sc.created_date DESC
    `;
  },

  async create(data: CreateSupplierCost): Promise<SupplierCost> {
    const [cost] = await sql<SupplierCost[]>`
      INSERT INTO supplier_costs ${sql(data)}
      RETURNING *
    `;
    return cost;
  },

  async update(data: UpdateSupplierCost): Promise<SupplierCost> {
    const { supplier_cost_id, ...updates } = data;
    const [cost] = await sql<SupplierCost[]>`
      UPDATE supplier_costs 
      SET ${sql(updates)}
      WHERE supplier_cost_id = ${supplier_cost_id}
      RETURNING *
    `;
    return cost;
  },

  async delete(id: string): Promise<void> {
    await sql`UPDATE supplier_costs SET is_active = false WHERE supplier_cost_id = ${id}`;
  },

  async createFromBidPricing(builderId: string, bidPricingData: any): Promise<SupplierCost> {
    const costData: CreateSupplierCost = {
      builder_id: builderId,
      builder_supplier_id: bidPricingData.builder_supplier_id,
      region_id: bidPricingData.region_id,
      community_id: bidPricingData.community_id,
      estimating_db_item_id: bidPricingData.estimating_db_item_id,
      unit_of_measure: bidPricingData.unit_of_measure,
      base_cost: bidPricingData.unit_cost,
      total_cost: bidPricingData.unit_price,
      effective_date: new Date(),
      item_type: 'Bid Winner',
      notes: `Created from supplier bid pricing. Original bid: ${bidPricingData.bid_description || 'N/A'}`,
      created_by: bidPricingData.created_by,
    };

    return await this.create(costData);
  }
};