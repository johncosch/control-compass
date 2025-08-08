

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."Certification" AS ENUM (
    'UL_508A',
    'ISO_9001',
    'ISO_14001',
    'OHSAS_18001',
    'IEC_61511',
    'ISA_84',
    'NFPA_70E',
    'OSHA_10',
    'OSHA_30',
    'SIL_CERTIFIED'
);


ALTER TYPE "public"."Certification" OWNER TO "postgres";


CREATE TYPE "public"."CompanySize" AS ENUM (
    'SIZE_1_10',
    'SIZE_11_50',
    'SIZE_51_200',
    'SIZE_201_500',
    'SIZE_501_1000',
    'SIZE_1001_5000',
    'SIZE_5001_10000',
    'SIZE_10000_PLUS'
);


ALTER TYPE "public"."CompanySize" OWNER TO "postgres";


CREATE TYPE "public"."CompanyStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE "public"."CompanyStatus" OWNER TO "postgres";


CREATE TYPE "public"."Industry" AS ENUM (
    'MANUFACTURING',
    'OIL_GAS',
    'CHEMICAL_PETROCHEMICAL',
    'FOOD_BEVERAGE',
    'PHARMACEUTICAL',
    'AUTOMOTIVE',
    'AEROSPACE',
    'WATER_WASTEWATER',
    'POWER_UTILITIES',
    'MINING_METALS'
);


ALTER TYPE "public"."Industry" OWNER TO "postgres";


CREATE TYPE "public"."Service" AS ENUM (
    'SYSTEM_INTEGRATION',
    'PLC_PROGRAMMING',
    'HMI_DEVELOPMENT',
    'SCADA_SYSTEMS',
    'INDUSTRIAL_NETWORKING',
    'PROCESS_AUTOMATION',
    'MOTION_CONTROL',
    'SAFETY_SYSTEMS',
    'MAINTENANCE_SERVICES',
    'TRAINING_CONSULTING',
    'CONTROL_PANEL_ASSEMBLY',
    'CALIBRATION_SERVICES'
);


ALTER TYPE "public"."Service" OWNER TO "postgres";


CREATE TYPE "public"."UserCompanyRelation" AS ENUM (
    'OWNER',
    'MEMBER'
);


ALTER TYPE "public"."UserCompanyRelation" OWNER TO "postgres";


CREATE TYPE "public"."UserRole" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE "public"."UserRole" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "hqCity" "text",
    "hqState" "text",
    "hqCountry" "text" DEFAULT 'US'::"text" NOT NULL,
    "yearFounded" integer,
    "sizeBucket" "public"."CompanySize",
    "phone" "text",
    "salesEmail" "text",
    "websiteUrl" "text",
    "logoUrl" "text",
    "logoBytes" integer,
    "status" "public"."CompanyStatus" DEFAULT 'PENDING'::"public"."CompanyStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_certifications" (
    "id" "text" NOT NULL,
    "companyId" "text" NOT NULL,
    "certification" "public"."Certification" NOT NULL
);


ALTER TABLE "public"."company_certifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_industries" (
    "id" "text" NOT NULL,
    "companyId" "text" NOT NULL,
    "industry" "public"."Industry" NOT NULL
);


ALTER TABLE "public"."company_industries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_invites" (
    "id" "text" NOT NULL,
    "companyId" "text" NOT NULL,
    "email" "text" NOT NULL,
    "invitedBy" "text" NOT NULL,
    "accepted" boolean DEFAULT false NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."company_invites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_locations_served" (
    "id" "text" NOT NULL,
    "companyId" "text" NOT NULL,
    "country" "text" NOT NULL,
    "state" "text",
    "region" "text"
);


ALTER TABLE "public"."company_locations_served" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_services" (
    "id" "text" NOT NULL,
    "companyId" "text" NOT NULL,
    "service" "public"."Service" NOT NULL
);


ALTER TABLE "public"."company_services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_companies" (
    "id" "text" NOT NULL,
    "userId" "text" NOT NULL,
    "companyId" "text" NOT NULL,
    "relation" "public"."UserCompanyRelation" DEFAULT 'MEMBER'::"public"."UserCompanyRelation" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."user_companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "text" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text",
    "role" "public"."UserRole" DEFAULT 'USER'::"public"."UserRole" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_certifications"
    ADD CONSTRAINT "company_certifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_industries"
    ADD CONSTRAINT "company_industries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_invites"
    ADD CONSTRAINT "company_invites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_locations_served"
    ADD CONSTRAINT "company_locations_served_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_services"
    ADD CONSTRAINT "company_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "companies_slug_key" ON "public"."companies" USING "btree" ("slug");



CREATE UNIQUE INDEX "company_certifications_companyId_certification_key" ON "public"."company_certifications" USING "btree" ("companyId", "certification");



CREATE UNIQUE INDEX "company_industries_companyId_industry_key" ON "public"."company_industries" USING "btree" ("companyId", "industry");



CREATE UNIQUE INDEX "company_invites_companyId_email_key" ON "public"."company_invites" USING "btree" ("companyId", "email");



CREATE UNIQUE INDEX "company_locations_served_companyId_country_state_region_key" ON "public"."company_locations_served" USING "btree" ("companyId", "country", "state", "region");



CREATE UNIQUE INDEX "company_services_companyId_service_key" ON "public"."company_services" USING "btree" ("companyId", "service");



CREATE UNIQUE INDEX "user_companies_userId_companyId_key" ON "public"."user_companies" USING "btree" ("userId", "companyId");



CREATE UNIQUE INDEX "users_email_key" ON "public"."users" USING "btree" ("email");



ALTER TABLE ONLY "public"."company_certifications"
    ADD CONSTRAINT "company_certifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_industries"
    ADD CONSTRAINT "company_industries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_invites"
    ADD CONSTRAINT "company_invites_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_invites"
    ADD CONSTRAINT "company_invites_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."company_locations_served"
    ADD CONSTRAINT "company_locations_served_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_services"
    ADD CONSTRAINT "company_services_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_companies"
    ADD CONSTRAINT "user_companies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_certifications" TO "anon";
GRANT ALL ON TABLE "public"."company_certifications" TO "authenticated";
GRANT ALL ON TABLE "public"."company_certifications" TO "service_role";



GRANT ALL ON TABLE "public"."company_industries" TO "anon";
GRANT ALL ON TABLE "public"."company_industries" TO "authenticated";
GRANT ALL ON TABLE "public"."company_industries" TO "service_role";



GRANT ALL ON TABLE "public"."company_invites" TO "anon";
GRANT ALL ON TABLE "public"."company_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."company_invites" TO "service_role";



GRANT ALL ON TABLE "public"."company_locations_served" TO "anon";
GRANT ALL ON TABLE "public"."company_locations_served" TO "authenticated";
GRANT ALL ON TABLE "public"."company_locations_served" TO "service_role";



GRANT ALL ON TABLE "public"."company_services" TO "anon";
GRANT ALL ON TABLE "public"."company_services" TO "authenticated";
GRANT ALL ON TABLE "public"."company_services" TO "service_role";



GRANT ALL ON TABLE "public"."user_companies" TO "anon";
GRANT ALL ON TABLE "public"."user_companies" TO "authenticated";
GRANT ALL ON TABLE "public"."user_companies" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
