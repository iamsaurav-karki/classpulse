-- Migration: Add 'waiting_for_user' status to ticket_status enum
-- Run this if your database doesn't have the new status yet

-- First, check if the status already exists
DO $$ 
BEGIN
    -- Add the new status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'waiting_for_user' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ticket_status')
    ) THEN
        ALTER TYPE ticket_status ADD VALUE 'waiting_for_user';
    END IF;
END $$;

