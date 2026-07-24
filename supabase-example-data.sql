-- Example / showcase data for DSBlive
-- Run this AFTER supabase-setup.sql, on a FRESH database.
-- IMPORTANT: this assumes empty tables so BIGSERIAL ids start at 1
-- (field ids 1..14, form ids 1..3). The numeric keys inside records.data
-- ("1", "2", ...) are field ids. On a fresh DB they map as commented below.

-- ----------------------------------------------------------------------------
-- Fields (ids 1..14 in insert order)
-- ----------------------------------------------------------------------------
INSERT INTO fields (name, data_type, options) VALUES
  ('product_name',  'text',     NULL),                                      -- 1
  ('price',         'number',   NULL),                                      -- 2
  ('quantity',      'number',   NULL),                                      -- 3
  ('unit',          'selector', '["kg", "liters", "units", "pieces"]'),     -- 4
  ('store',         'text',     NULL),                                      -- 5
  ('category',      'selector', '["Food", "Toys", "Health", "Accessories", "Cleaning"]'), -- 6
  ('purchase_date', 'date',     NULL),                                      -- 7
  ('in_stock',      'boolean',  NULL),                                      -- 8
  ('food_type',     'text',     NULL),                                      -- 9
  ('amount_grams',  'number',   NULL),                                      -- 10
  ('feeding_time',  'time',     NULL),                                      -- 11
  ('feeding_date',  'date',     NULL),                                      -- 12
  ('quality',       'selector', '["Excellent", "Good", "Fair", "Poor"]'),  -- 13
  ('notes',         'text',     NULL);                                      -- 14

-- ----------------------------------------------------------------------------
-- Form types (ids 1..3)
-- ----------------------------------------------------------------------------
INSERT INTO form_types (name, description) VALUES
  ('Product Purchases', 'Pet supply purchase records'),     -- 1
  ('Cat Feeding',       'Daily food consumption tracking'), -- 2
  ('Inventory',         'Current stock control');           -- 3

-- ----------------------------------------------------------------------------
-- Field <-> form associations
-- ----------------------------------------------------------------------------
-- Product Purchases (form 1)
INSERT INTO form_fields (form_type_id, field_id, sort_order) VALUES
  (1, 1, 0), (1, 2, 1), (1, 3, 2), (1, 4, 3), (1, 5, 4), (1, 6, 5), (1, 7, 6);

-- Cat Feeding (form 2)
INSERT INTO form_fields (form_type_id, field_id, sort_order) VALUES
  (2, 9, 0), (2, 10, 1), (2, 11, 2), (2, 12, 3), (2, 13, 4);

-- Inventory (form 3)
INSERT INTO form_fields (form_type_id, field_id, sort_order) VALUES
  (3, 1, 0), (3, 3, 1), (3, 4, 2), (3, 6, 3), (3, 8, 4), (3, 14, 5);

-- ----------------------------------------------------------------------------
-- Records
-- ----------------------------------------------------------------------------
-- Product Purchases: keys 1=name 2=price 3=qty 4=unit 5=store 6=category 7=date
INSERT INTO records (form_type_id, data) VALUES
  (1, '{"1": "Cat litter",       "2": "150", "3": "5",  "4": "kg",     "5": "Walmart", "6": "Cleaning",    "7": "2026-07-14"}'),
  (1, '{"1": "Cat food premium", "2": "280", "3": "3",  "4": "kg",     "5": "Petco",   "6": "Food",        "7": "2026-07-15"}'),
  (1, '{"1": "Cat litter",       "2": "145", "3": "5",  "4": "kg",     "5": "Costco",  "6": "Cleaning",    "7": "2026-07-16"}'),
  (1, '{"1": "Mouse toy",        "2": "45",  "3": "2",  "4": "pieces", "5": "Amazon",  "6": "Toys",        "7": "2026-07-16"}'),
  (1, '{"1": "Wet food cans",    "2": "95",  "3": "12", "4": "units",  "5": "Walmart", "6": "Food",        "7": "2026-07-17"}'),
  (1, '{"1": "Flea shampoo",     "2": "120", "3": "1",  "4": "units",  "5": "Petco",   "6": "Health",      "7": "2026-07-18"}'),
  (1, '{"1": "Scratching post",  "2": "350", "3": "1",  "4": "pieces", "5": "Amazon",  "6": "Accessories", "7": "2026-07-19"}'),
  (1, '{"1": "Dry food",         "2": "260", "3": "4",  "4": "kg",     "5": "Costco",  "6": "Food",        "7": "2026-07-20"}'),
  (1, '{"1": "Water fountain",   "2": "480", "3": "1",  "4": "pieces", "5": "Amazon",  "6": "Accessories", "7": "2026-07-21"}'),
  (1, '{"1": "Cat litter",       "2": "150", "3": "6",  "4": "kg",     "5": "Walmart", "6": "Cleaning",    "7": "2026-07-22"}'),
  (1, '{"1": "Vitamins",         "2": "210", "3": "1",  "4": "units",  "5": "Petco",   "6": "Health",      "7": "2026-07-22"}'),
  (1, '{"1": "Wet food cans",    "2": "98",  "3": "12", "4": "units",  "5": "Costco",  "6": "Food",        "7": "2026-07-23"}');

-- Cat Feeding: keys 9=food_type 10=grams 11=time 12=date 13=quality
INSERT INTO records (form_type_id, data) VALUES
  (2, '{"9": "Kibble",   "10": "50", "11": "08:00", "12": "2026-07-21", "13": "Good"}'),
  (2, '{"9": "Wet food", "10": "85", "11": "14:00", "12": "2026-07-21", "13": "Excellent"}'),
  (2, '{"9": "Kibble",   "10": "50", "11": "20:00", "12": "2026-07-21", "13": "Good"}'),
  (2, '{"9": "Kibble",   "10": "45", "11": "08:00", "12": "2026-07-22", "13": "Fair"}'),
  (2, '{"9": "Wet food", "10": "85", "11": "14:00", "12": "2026-07-22", "13": "Excellent"}'),
  (2, '{"9": "Kibble",   "10": "50", "11": "20:00", "12": "2026-07-22", "13": "Good"}'),
  (2, '{"9": "Kibble",   "10": "50", "11": "08:00", "12": "2026-07-23", "13": "Good"}'),
  (2, '{"9": "Wet food", "10": "90", "11": "14:00", "12": "2026-07-23", "13": "Excellent"}'),
  (2, '{"9": "Treats",   "10": "20", "11": "17:00", "12": "2026-07-23", "13": "Good"}');

-- Inventory: keys 1=name 3=qty 4=unit 6=category 8=in_stock 14=notes
INSERT INTO records (form_type_id, data) VALUES
  (3, '{"1": "Dry food",        "3": "4",  "4": "kg",     "6": "Food",        "8": "true",  "14": "Main storage"}'),
  (3, '{"1": "Cat litter",      "3": "6",  "4": "kg",     "6": "Cleaning",    "8": "true",  "14": "Bulk pack"}'),
  (3, '{"1": "Wet food cans",   "3": "24", "4": "units",  "6": "Food",        "8": "true",  "14": "Fridge shelf"}'),
  (3, '{"1": "Flea shampoo",    "3": "0",  "4": "units",  "6": "Health",      "8": "false", "14": "Reorder needed"}'),
  (3, '{"1": "Scratching post", "3": "1",  "4": "pieces", "6": "Accessories", "8": "true",  "14": "Living room"}'),
  (3, '{"1": "Vitamins",        "3": "2",  "4": "units",  "6": "Health",      "8": "true",  "14": "Cabinet"}'),
  (3, '{"1": "Mouse toy",       "3": "3",  "4": "pieces", "6": "Toys",        "8": "true",  "14": "Toy box"}'),
  (3, '{"1": "Water filter",    "3": "0",  "4": "pieces", "6": "Accessories", "8": "false", "14": "Out of stock"}');
