export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          accuracy: string | null
          city: string | null
          city_norm: string | null
          created_at: string
          district: string | null
          geom: unknown
          hash: string
          id: number
          number: string | null
          number_norm: string | null
          openaddresses_id: string | null
          postcode: string | null
          region: string | null
          street: string
          street_norm: string | null
          unit: string | null
        }
        Insert: {
          accuracy?: string | null
          city?: string | null
          city_norm?: string | null
          created_at?: string
          district?: string | null
          geom: unknown
          hash: string
          id?: number
          number?: string | null
          number_norm?: string | null
          openaddresses_id?: string | null
          postcode?: string | null
          region?: string | null
          street: string
          street_norm?: string | null
          unit?: string | null
        }
        Update: {
          accuracy?: string | null
          city?: string | null
          city_norm?: string | null
          created_at?: string
          district?: string | null
          geom?: unknown
          hash?: string
          id?: number
          number?: string | null
          number_norm?: string | null
          openaddresses_id?: string | null
          postcode?: string | null
          region?: string | null
          street?: string
          street_norm?: string | null
          unit?: string | null
        }
        Relationships: []
      }
      app_permissions: {
        Row: {
          created_at: string
          description: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          name?: string
        }
        Relationships: []
      }
      app_roles: {
        Row: {
          created_at: string
          description: string | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          name?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          app_bldg_agriculture: number | null
          app_bldg_commercial: number | null
          app_bldg_exempt: number | null
          app_bldg_residential: number | null
          app_land_agriculture: number | null
          app_land_commercial: number | null
          app_land_exempt: number | null
          app_land_residential: number | null
          app_new_const_agriculture: number | null
          app_new_const_commercial: number | null
          app_new_const_exempt: number | null
          app_new_const_residential: number | null
          app_total: number | null
          bldg_agriculture: number | null
          bldg_commercial: number | null
          bldg_exempt: number | null
          bldg_residential: number | null
          category: string | null
          change_reason: string | null
          changed_by: string | null
          date_of_assessment: string | null
          hash_id: string | null
          id: number
          land_agriculture: number | null
          land_commercial: number | null
          land_exempt: number | null
          land_residential: number | null
          last_changed: string | null
          new_const_agriculture: number | null
          new_const_commercial: number | null
          new_const_exempt: number | null
          new_const_residential: number | null
          parcel_id: number | null
          report_timestamp: string | null
        }
        Insert: {
          app_bldg_agriculture?: number | null
          app_bldg_commercial?: number | null
          app_bldg_exempt?: number | null
          app_bldg_residential?: number | null
          app_land_agriculture?: number | null
          app_land_commercial?: number | null
          app_land_exempt?: number | null
          app_land_residential?: number | null
          app_new_const_agriculture?: number | null
          app_new_const_commercial?: number | null
          app_new_const_exempt?: number | null
          app_new_const_residential?: number | null
          app_total?: number | null
          bldg_agriculture?: number | null
          bldg_commercial?: number | null
          bldg_exempt?: number | null
          bldg_residential?: number | null
          category?: string | null
          change_reason?: string | null
          changed_by?: string | null
          date_of_assessment?: string | null
          hash_id?: string | null
          id?: number
          land_agriculture?: number | null
          land_commercial?: number | null
          land_exempt?: number | null
          land_residential?: number | null
          last_changed?: string | null
          new_const_agriculture?: number | null
          new_const_commercial?: number | null
          new_const_exempt?: number | null
          new_const_residential?: number | null
          parcel_id?: number | null
          report_timestamp?: string | null
        }
        Update: {
          app_bldg_agriculture?: number | null
          app_bldg_commercial?: number | null
          app_bldg_exempt?: number | null
          app_bldg_residential?: number | null
          app_land_agriculture?: number | null
          app_land_commercial?: number | null
          app_land_exempt?: number | null
          app_land_residential?: number | null
          app_new_const_agriculture?: number | null
          app_new_const_commercial?: number | null
          app_new_const_exempt?: number | null
          app_new_const_residential?: number | null
          app_total?: number | null
          bldg_agriculture?: number | null
          bldg_commercial?: number | null
          bldg_exempt?: number | null
          bldg_residential?: number | null
          category?: string | null
          change_reason?: string | null
          changed_by?: string | null
          date_of_assessment?: string | null
          hash_id?: string | null
          id?: number
          land_agriculture?: number | null
          land_commercial?: number | null
          land_exempt?: number | null
          land_residential?: number | null
          last_changed?: string | null
          new_const_agriculture?: number | null
          new_const_commercial?: number | null
          new_const_exempt?: number | null
          new_const_residential?: number | null
          parcel_id?: number | null
          report_timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      assessor_neighborhoods: {
        Row: {
          created_at: string
          geom: unknown
          group: string | null
          id: number
          name: string
          source_id: string | null
        }
        Insert: {
          created_at?: string
          geom: unknown
          group?: string | null
          id?: number
          name: string
          source_id?: string | null
        }
        Update: {
          created_at?: string
          geom?: unknown
          group?: string | null
          id?: number
          name?: string
          source_id?: string | null
        }
        Relationships: []
      }
      cda_neighborhoods: {
        Row: {
          created_at: string
          geom: unknown
          group: string | null
          id: number
          name: string
          source_id: string
        }
        Insert: {
          created_at?: string
          geom: unknown
          group?: string | null
          id?: number
          name: string
          source_id: string
        }
        Update: {
          created_at?: string
          geom?: unknown
          group?: string | null
          id?: number
          name?: string
          source_id?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          created_by: string
          email: string | null
          first_name: string
          hire_date: string
          id: number
          last_name: string
          role: string
          status: string
          termination_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string
          email?: string | null
          first_name: string
          hire_date: string
          id?: never
          last_name: string
          role?: string
          status?: string
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string | null
          first_name?: string
          hire_date?: string
          id?: never
          last_name?: string
          role?: string
          status?: string
          termination_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_role_fk"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "app_roles"
            referencedColumns: ["name"]
          },
        ]
      }
      geometries: {
        Row: {
          created_at: string
          geom: unknown
          id: number
          parcel_id: number
          parcel_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          geom: unknown
          id?: number
          parcel_id: number
          parcel_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          geom?: unknown
          id?: number
          parcel_id?: number
          parcel_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geometries_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      neighborhood_summaries: {
        Row: {
          computed_at: string
          created_at: string
          id: number
          metrics: Json
          neighborhood_id: string
          neighborhood_type: string
          summary_type: string
          updated_at: string
        }
        Insert: {
          computed_at?: string
          created_at?: string
          id?: number
          metrics: Json
          neighborhood_id: string
          neighborhood_type: string
          summary_type: string
          updated_at?: string
        }
        Update: {
          computed_at?: string
          created_at?: string
          id?: number
          metrics?: Json
          neighborhood_id?: string
          neighborhood_type?: string
          summary_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      parcel_search_table: {
        Row: {
          abatement_end_year: number | null
          abatement_start_year: number | null
          abatement_type: string | null
          appraised_agr_improvements: number | null
          appraised_agr_land: number | null
          appraised_com_improvements: number | null
          appraised_com_land: number | null
          appraised_land: number | null
          appraised_res_improvements: number | null
          appraised_res_land: number | null
          appraised_total: number | null
          assessed_agr_improvements: number | null
          assessed_agr_land: number | null
          assessed_com_improvements: number | null
          assessed_com_land: number | null
          assessed_improvements: number | null
          assessed_land: number | null
          assessed_res_improvements: number | null
          assessed_res_land: number | null
          assessed_total: number | null
          assessor_neighborhood: string | null
          avg_year_built: number | null
          block: string | null
          building_json: Json | null
          cda_neighborhood: string | null
          centroid: unknown
          class_code: number | null
          collector_parcel_id: string | null
          cost_json: Json | null
          created_at: string
          current_appraiser: string | null
          ext: string | null
          finished_basement_area: number | null
          geo_handle: string | null
          geometry: unknown
          ground_floor_area: number | null
          high_address_number: number | null
          high_address_suffix: string | null
          id: number
          is_active: boolean | null
          land_area: number | null
          lot: string | null
          low_address_number: number | null
          low_address_suffix: string | null
          number_of_apartments: number | null
          number_of_apartments_one_bedroom: number | null
          number_of_apartments_three_bedroom: number | null
          number_of_apartments_two_bedroom: number | null
          number_of_buildings: number | null
          number_of_carports: number | null
          number_of_full_baths: number | null
          number_of_garages: number | null
          number_of_half_baths: number | null
          number_of_stories: number | null
          number_of_units: number | null
          occupancy: string | null
          owner_address: string | null
          owner_city: string | null
          owner_country: string | null
          owner_name: string | null
          owner_name_2: string | null
          owner_state: string | null
          owner_zip: string | null
          parcel_id: number | null
          property_class: string | null
          sbd_district_1: string | null
          sbd_district_2: string | null
          sbd_district_3: string | null
          search_text: string | null
          std_unit_number: string | null
          street_name: string | null
          street_prefix_direction: string | null
          street_type: string | null
          struct_rcnld_with_oby: number | null
          struct_rcnld_with_oby_and_land: number | null
          tax_status: string | null
          tif_district: string | null
          total_area: number | null
          total_living_area: number | null
          updated_at: string | null
          ward: string | null
          zip: string | null
        }
        Insert: {
          abatement_end_year?: number | null
          abatement_start_year?: number | null
          abatement_type?: string | null
          appraised_agr_improvements?: number | null
          appraised_agr_land?: number | null
          appraised_com_improvements?: number | null
          appraised_com_land?: number | null
          appraised_land?: number | null
          appraised_res_improvements?: number | null
          appraised_res_land?: number | null
          appraised_total?: number | null
          assessed_agr_improvements?: number | null
          assessed_agr_land?: number | null
          assessed_com_improvements?: number | null
          assessed_com_land?: number | null
          assessed_improvements?: number | null
          assessed_land?: number | null
          assessed_res_improvements?: number | null
          assessed_res_land?: number | null
          assessed_total?: number | null
          assessor_neighborhood?: string | null
          avg_year_built?: number | null
          block?: string | null
          building_json?: Json | null
          cda_neighborhood?: string | null
          centroid?: unknown
          class_code?: number | null
          collector_parcel_id?: string | null
          cost_json?: Json | null
          created_at?: string
          current_appraiser?: string | null
          ext?: string | null
          finished_basement_area?: number | null
          geo_handle?: string | null
          geometry?: unknown
          ground_floor_area?: number | null
          high_address_number?: number | null
          high_address_suffix?: string | null
          id?: number
          is_active?: boolean | null
          land_area?: number | null
          lot?: string | null
          low_address_number?: number | null
          low_address_suffix?: string | null
          number_of_apartments?: number | null
          number_of_apartments_one_bedroom?: number | null
          number_of_apartments_three_bedroom?: number | null
          number_of_apartments_two_bedroom?: number | null
          number_of_buildings?: number | null
          number_of_carports?: number | null
          number_of_full_baths?: number | null
          number_of_garages?: number | null
          number_of_half_baths?: number | null
          number_of_stories?: number | null
          number_of_units?: number | null
          occupancy?: string | null
          owner_address?: string | null
          owner_city?: string | null
          owner_country?: string | null
          owner_name?: string | null
          owner_name_2?: string | null
          owner_state?: string | null
          owner_zip?: string | null
          parcel_id?: number | null
          property_class?: string | null
          sbd_district_1?: string | null
          sbd_district_2?: string | null
          sbd_district_3?: string | null
          search_text?: string | null
          std_unit_number?: string | null
          street_name?: string | null
          street_prefix_direction?: string | null
          street_type?: string | null
          struct_rcnld_with_oby?: number | null
          struct_rcnld_with_oby_and_land?: number | null
          tax_status?: string | null
          tif_district?: string | null
          total_area?: number | null
          total_living_area?: number | null
          updated_at?: string | null
          ward?: string | null
          zip?: string | null
        }
        Update: {
          abatement_end_year?: number | null
          abatement_start_year?: number | null
          abatement_type?: string | null
          appraised_agr_improvements?: number | null
          appraised_agr_land?: number | null
          appraised_com_improvements?: number | null
          appraised_com_land?: number | null
          appraised_land?: number | null
          appraised_res_improvements?: number | null
          appraised_res_land?: number | null
          appraised_total?: number | null
          assessed_agr_improvements?: number | null
          assessed_agr_land?: number | null
          assessed_com_improvements?: number | null
          assessed_com_land?: number | null
          assessed_improvements?: number | null
          assessed_land?: number | null
          assessed_res_improvements?: number | null
          assessed_res_land?: number | null
          assessed_total?: number | null
          assessor_neighborhood?: string | null
          avg_year_built?: number | null
          block?: string | null
          building_json?: Json | null
          cda_neighborhood?: string | null
          centroid?: unknown
          class_code?: number | null
          collector_parcel_id?: string | null
          cost_json?: Json | null
          created_at?: string
          current_appraiser?: string | null
          ext?: string | null
          finished_basement_area?: number | null
          geo_handle?: string | null
          geometry?: unknown
          ground_floor_area?: number | null
          high_address_number?: number | null
          high_address_suffix?: string | null
          id?: number
          is_active?: boolean | null
          land_area?: number | null
          lot?: string | null
          low_address_number?: number | null
          low_address_suffix?: string | null
          number_of_apartments?: number | null
          number_of_apartments_one_bedroom?: number | null
          number_of_apartments_three_bedroom?: number | null
          number_of_apartments_two_bedroom?: number | null
          number_of_buildings?: number | null
          number_of_carports?: number | null
          number_of_full_baths?: number | null
          number_of_garages?: number | null
          number_of_half_baths?: number | null
          number_of_stories?: number | null
          number_of_units?: number | null
          occupancy?: string | null
          owner_address?: string | null
          owner_city?: string | null
          owner_country?: string | null
          owner_name?: string | null
          owner_name_2?: string | null
          owner_state?: string | null
          owner_zip?: string | null
          parcel_id?: number | null
          property_class?: string | null
          sbd_district_1?: string | null
          sbd_district_2?: string | null
          sbd_district_3?: string | null
          search_text?: string | null
          std_unit_number?: string | null
          street_name?: string | null
          street_prefix_direction?: string | null
          street_type?: string | null
          struct_rcnld_with_oby?: number | null
          struct_rcnld_with_oby_and_land?: number | null
          tax_status?: string | null
          tif_district?: string | null
          total_area?: number | null
          total_living_area?: number | null
          updated_at?: string | null
          ward?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      parcels: {
        Row: {
          block: number | null
          created_at: string
          ext: number | null
          id: number
          lot: number | null
          parcel_number: string | null
          retired_at: string | null
        }
        Insert: {
          block?: number | null
          created_at?: string
          ext?: number | null
          id?: number
          lot?: number | null
          parcel_number?: string | null
          retired_at?: string | null
        }
        Update: {
          block?: number | null
          created_at?: string
          ext?: number | null
          id?: number
          lot?: number | null
          parcel_number?: string | null
          retired_at?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: number
          permission: string
          role: string
        }
        Insert: {
          id?: never
          permission: string
          role: string
        }
        Update: {
          id?: never
          permission?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_fkey"
            columns: ["permission"]
            isOneToOne: false
            referencedRelation: "app_permissions"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "role_permissions_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "app_roles"
            referencedColumns: ["name"]
          },
        ]
      }
      sales_summary: {
        Row: {
          appraised_improvements: number | null
          appraised_land: number | null
          appraised_total: number | null
          avg_year_built: number | null
          building_json: Json | null
          centroid_x: number | null
          centroid_y: number | null
          cost_with_land_ratio: number | null
          current_appraised_ratio: number | null
          field_review_date: string | null
          finished_basement_area: number | null
          ground_floor_area: number | null
          id: number
          land_area: number | null
          number_of_apartments: number | null
          number_of_apartments_one_bed: number | null
          number_of_apartments_three_bed: number | null
          number_of_apartments_two_bed: number | null
          number_of_buildings: number | null
          number_of_carports: number | null
          number_of_full_baths: number | null
          number_of_garages: number | null
          number_of_half_baths: number | null
          number_of_parcels: number | null
          number_of_stories: number | null
          number_of_units: number | null
          parcels_json: Json | null
          res_cost_json: Json | null
          sale_date: string | null
          sale_id: number | null
          sale_price: number | null
          sale_type: string | null
          struct_rcnld_with_oby: number | null
          struct_rcnld_with_oby_and_land: number | null
          total_area: number | null
          total_living_area: number | null
        }
        Insert: {
          appraised_improvements?: number | null
          appraised_land?: number | null
          appraised_total?: number | null
          avg_year_built?: number | null
          building_json?: Json | null
          centroid_x?: number | null
          centroid_y?: number | null
          cost_with_land_ratio?: number | null
          current_appraised_ratio?: number | null
          field_review_date?: string | null
          finished_basement_area?: number | null
          ground_floor_area?: number | null
          id?: number
          land_area?: number | null
          number_of_apartments?: number | null
          number_of_apartments_one_bed?: number | null
          number_of_apartments_three_bed?: number | null
          number_of_apartments_two_bed?: number | null
          number_of_buildings?: number | null
          number_of_carports?: number | null
          number_of_full_baths?: number | null
          number_of_garages?: number | null
          number_of_half_baths?: number | null
          number_of_parcels?: number | null
          number_of_stories?: number | null
          number_of_units?: number | null
          parcels_json?: Json | null
          res_cost_json?: Json | null
          sale_date?: string | null
          sale_id?: number | null
          sale_price?: number | null
          sale_type?: string | null
          struct_rcnld_with_oby?: number | null
          struct_rcnld_with_oby_and_land?: number | null
          total_area?: number | null
          total_living_area?: number | null
        }
        Update: {
          appraised_improvements?: number | null
          appraised_land?: number | null
          appraised_total?: number | null
          avg_year_built?: number | null
          building_json?: Json | null
          centroid_x?: number | null
          centroid_y?: number | null
          cost_with_land_ratio?: number | null
          current_appraised_ratio?: number | null
          field_review_date?: string | null
          finished_basement_area?: number | null
          ground_floor_area?: number | null
          id?: number
          land_area?: number | null
          number_of_apartments?: number | null
          number_of_apartments_one_bed?: number | null
          number_of_apartments_three_bed?: number | null
          number_of_apartments_two_bed?: number | null
          number_of_buildings?: number | null
          number_of_carports?: number | null
          number_of_full_baths?: number | null
          number_of_garages?: number | null
          number_of_half_baths?: number | null
          number_of_parcels?: number | null
          number_of_stories?: number | null
          number_of_units?: number | null
          parcels_json?: Json | null
          res_cost_json?: Json | null
          sale_date?: string | null
          sale_id?: number | null
          sale_price?: number | null
          sale_type?: string | null
          struct_rcnld_with_oby?: number | null
          struct_rcnld_with_oby_and_land?: number | null
          total_area?: number | null
          total_living_area?: number | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      us_gaz: {
        Row: {
          id: number
          is_custom: boolean
          seq: number | null
          stdword: string | null
          token: number | null
          word: string | null
        }
        Insert: {
          id?: number
          is_custom?: boolean
          seq?: number | null
          stdword?: string | null
          token?: number | null
          word?: string | null
        }
        Update: {
          id?: number
          is_custom?: boolean
          seq?: number | null
          stdword?: string | null
          token?: number | null
          word?: string | null
        }
        Relationships: []
      }
      us_lex: {
        Row: {
          id: number
          is_custom: boolean
          seq: number | null
          stdword: string | null
          token: number | null
          word: string | null
        }
        Insert: {
          id?: number
          is_custom?: boolean
          seq?: number | null
          stdword?: string | null
          token?: number | null
          word?: string | null
        }
        Update: {
          id?: number
          is_custom?: boolean
          seq?: number | null
          stdword?: string | null
          token?: number | null
          word?: string | null
        }
        Relationships: []
      }
      us_rules: {
        Row: {
          id: number
          is_custom: boolean
          rule: string | null
        }
        Insert: {
          id?: number
          is_custom?: boolean
          rule?: string | null
        }
        Update: {
          id?: number
          is_custom?: boolean
          rule?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string
          id: number
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string
          id?: never
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string
          id?: never
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "app_roles"
            referencedColumns: ["name"]
          },
        ]
      }
      wards: {
        Row: {
          census_year: number | null
          created_at: string
          geom: unknown
          group: string | null
          id: number
          name: string
          source_id: string | null
        }
        Insert: {
          census_year?: number | null
          created_at?: string
          geom: unknown
          group?: string | null
          id?: number
          name: string
          source_id?: string | null
        }
        Update: {
          census_year?: number | null
          created_at?: string
          geom?: unknown
          group?: string | null
          id?: number
          name?: string
          source_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      authorize: { Args: { requested_permission: string }; Returns: boolean }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_latest_neighborhood_summary: {
        Args: {
          p_neighborhood_id: string
          p_neighborhood_type: string
          p_summary_type: string
        }
        Returns: {
          computed_at: string
          created_at: string
          id: number
          metrics: Json
          neighborhood_id: string
          neighborhood_type: string
          summary_type: string
          updated_at: string
        }[]
      }
      get_neighborhood_summaries_with_geom: {
        Args: never
        Returns: {
          geom: unknown
          latest_computed_at: string
          neighborhood_id: string
          neighborhood_type: string
          summaries: Json
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      is_admin: { Args: never; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      normalize_number: { Args: { number_text: string }; Returns: string }
      normalize_street: { Args: { street_text: string }; Returns: string }
      parcel_aggregation_by_assessor_neighborhood: {
        Args: {
          p_exclude_property_classes?: string[]
          p_tax_statuses?: string[]
        }
        Returns: {
          appraised_max: number
          appraised_mean: number
          appraised_median: number
          appraised_sum: number
          assessor_neighborhood_geom: unknown
          assessor_neighborhood_id: number
          assessor_neighborhood_name: string
          com_avg: number
          com_total: number
          parcel_count: number
          res_avg: number
          res_total: number
        }[]
      }
      parcel_aggregation_by_assessor_neighborhood_occupancy: {
        Args: {
          p_exclude_property_classes?: string[]
          p_tax_statuses?: string[]
        }
        Returns: {
          appraised_max: number
          appraised_mean: number
          appraised_median: number
          appraised_sum: number
          assessor_neighborhood_geom: unknown
          assessor_neighborhood_id: number
          assessor_neighborhood_name: string
          com_avg: number
          com_total: number
          occupancy: string
          parcel_count: number
          res_avg: number
          res_total: number
        }[]
      }
      parcel_aggregation_by_cda_neighborhood: {
        Args: {
          p_exclude_property_classes?: string[]
          p_tax_statuses?: string[]
        }
        Returns: {
          appraised_max: number
          appraised_mean: number
          appraised_median: number
          appraised_sum: number
          cda_neighborhood_geom: unknown
          cda_neighborhood_id: number
          cda_neighborhood_name: string
          com_avg: number
          com_total: number
          parcel_count: number
          res_avg: number
          res_total: number
        }[]
      }
      parcel_aggregation_by_cda_neighborhood_occupancy: {
        Args: {
          p_exclude_property_classes?: string[]
          p_tax_statuses?: string[]
        }
        Returns: {
          appraised_max: number
          appraised_mean: number
          appraised_median: number
          appraised_sum: number
          cda_neighborhood_geom: unknown
          cda_neighborhood_id: number
          cda_neighborhood_name: string
          com_avg: number
          com_total: number
          occupancy: string
          parcel_count: number
          res_avg: number
          res_total: number
        }[]
      }
      parcel_aggregation_by_ward: {
        Args: {
          p_exclude_property_classes?: string[]
          p_tax_statuses?: string[]
        }
        Returns: {
          appraised_max: number
          appraised_mean: number
          appraised_median: number
          appraised_sum: number
          com_avg: number
          com_total: number
          parcel_count: number
          res_avg: number
          res_total: number
          ward_geom: unknown
          ward_id: number
          ward_name: string
        }[]
      }
      parcel_aggregation_by_ward_occupancy: {
        Args: {
          p_exclude_property_classes?: string[]
          p_tax_statuses?: string[]
        }
        Returns: {
          appraised_max: number
          appraised_mean: number
          appraised_median: number
          appraised_sum: number
          com_avg: number
          com_total: number
          occupancy: string
          parcel_count: number
          res_avg: number
          res_total: number
          ward_geom: unknown
          ward_id: number
          ward_name: string
        }[]
      }
      parcel_search: {
        Args: {
          assessor_neighborhood_ids?: number[]
          block_numbers?: number[]
          cda_neighborhood_ids?: number[]
          max_app_total?: number
          min_app_total?: number
          sort_by?: string
          ward_ids?: number[]
        }
        Returns: {
          app_bldg_agriculture: number
          app_bldg_commercial: number
          app_bldg_exempt: number
          app_bldg_residential: number
          app_land_agriculture: number
          app_land_commercial: number
          app_land_exempt: number
          app_land_residential: number
          app_total: number
          assessment_category: string
          assessment_date: string
          assessment_id: number
          assessor_neighborhood_group: string
          assessor_neighborhood_id: number
          assessor_neighborhood_name: string
          bldg_agriculture: number
          bldg_commercial: number
          bldg_exempt: number
          bldg_residential: number
          block: number
          cda_neighborhood_group: string
          cda_neighborhood_id: number
          cda_neighborhood_name: string
          ext: number
          geom: unknown
          land_agriculture: number
          land_commercial: number
          land_exempt: number
          land_residential: number
          lot: number
          parcel_created_at: string
          parcel_id: number
          parcel_number: string
          parcel_retired_at: string
          ward_census_year: number
          ward_group: string
          ward_id: number
          ward_name: string
        }[]
      }
      parse_address: { Args: { "": string }; Returns: Record<string, unknown> }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      search_addresses: {
        Args: {
          exact_number?: string
          exact_postcode?: string
          exact_street?: string
          max_results?: number
          search_text?: string
          similarity_threshold?: number
        }
        Returns: {
          accuracy: string
          city: string
          district: string
          geom: unknown
          hash: string
          id: number
          number: string
          openaddresses_id: string
          postcode: string
          region: string
          similarity_score: number
          street: string
          unit: string
        }[]
      }
      search_neighborhood_summaries: {
        Args: {
          p_limit?: number
          p_neighborhood_id?: string
          p_neighborhood_type?: string
          p_offset?: number
          p_summary_type?: string
        }
        Returns: {
          computed_at: string
          created_at: string
          id: number
          metrics: Json
          neighborhood_id: string
          neighborhood_type: string
          summary_type: string
          updated_at: string
        }[]
      }
      search_parcels_with_range: {
        Args: { result_limit?: number; search_term: string }
        Returns: {
          block: string
          ext: string
          full_address: string
          id: number
          lot: string
          match_type: string
          owner_name: string
          parcel_id: number
          relevance_score: number
        }[]
      }
      search_sales: {
        Args: {
          p_assessor_neighborhoods?: number[]
          p_cda_neighborhoods?: number[]
          p_conditions?: string[]
          p_max_sale_date?: string
          p_max_sale_price?: number
          p_min_sale_date?: string
          p_min_sale_price?: number
          p_occupancies?: number[]
          p_sale_types?: string[]
          p_sort_ascending?: boolean
          p_sort_column?: string
          p_wards?: number[]
        }
        Returns: {
          appraised_improvements: number
          appraised_land: number
          appraised_total: number
          avg_year_built: number
          building_json: Json
          centroid_x: number
          centroid_y: number
          cost_with_land_ratio: number
          current_appraised_ratio: number
          field_review_date: string
          finished_basement_area: number
          ground_floor_area: number
          id: number
          land_area: number
          number_of_apartments: number
          number_of_apartments_one_bed: number
          number_of_apartments_three_bed: number
          number_of_apartments_two_bed: number
          number_of_buildings: number
          number_of_carports: number
          number_of_full_baths: number
          number_of_garages: number
          number_of_half_baths: number
          number_of_parcels: number
          number_of_stories: number
          number_of_units: number
          parcels_json: Json
          res_cost_json: Json
          sale_date: string
          sale_id: number
          sale_price: number
          sale_type: string
          struct_rcnld_with_oby: number
          struct_rcnld_with_oby_and_land: number
          total_area: number
          total_living_area: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      standardize_address:
        | {
            Args: {
              address: string
              gaztab: string
              lextab: string
              rultab: string
            }
            Returns: Database["public"]["CompositeTypes"]["stdaddr"]
            SetofOptions: {
              from: "*"
              to: "stdaddr"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: {
              gaztab: string
              lextab: string
              macro: string
              micro: string
              rultab: string
            }
            Returns: Database["public"]["CompositeTypes"]["stdaddr"]
            SetofOptions: {
              from: "*"
              to: "stdaddr"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      stdaddr: {
        building: string | null
        house_num: string | null
        predir: string | null
        qual: string | null
        pretype: string | null
        name: string | null
        suftype: string | null
        sufdir: string | null
        ruralroute: string | null
        extra: string | null
        city: string | null
        state: string | null
        country: string | null
        postcode: string | null
        box: string | null
        unit: string | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
