-- Fix instance limit function to support trial period without assigning basic package
-- This ensures new users don't automatically get basic package

CREATE OR REPLACE FUNCTION check_instance_limit(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    current_count INTEGER;
    max_allowed INTEGER;
    package_info RECORD;
    trial_info RECORD;
    result JSON;
BEGIN
    -- Get current instance count for user
    SELECT COUNT(*) INTO current_count
    FROM instances
    WHERE user_id = user_uuid AND status != 'deleted';

    -- Get user's package info
    SELECT 
        p.name,
        p.display_name_tr,
        p.display_name_en,
        p.max_instances
    INTO package_info
    FROM user_packages up
    JOIN packages p ON up.package_id = p.id
    WHERE up.user_id = user_uuid AND up.is_active = true
    ORDER BY up.created_at DESC
    LIMIT 1;

    -- If no package found, check trial period
    IF package_info IS NULL THEN
        -- Check if user has active trial
        SELECT 
            is_active,
            ends_at
        INTO trial_info
        FROM trial_periods
        WHERE user_id = user_uuid
        ORDER BY created_at DESC
        LIMIT 1;

        -- If user has active trial, allow 2 instances
        IF trial_info.is_active AND trial_info.ends_at > NOW() THEN
            max_allowed := 2;
            
            -- Build result JSON for trial user
            result := json_build_object(
                'can_create', current_count < max_allowed,
                'current_instances', current_count,
                'max_instances', max_allowed,
                'package_name', 'trial',
                'package_display_tr', 'Deneme Süresi',
                'package_display_en', 'Trial Period'
            );
            
            RETURN result;
        ELSE
            -- Trial expired or no trial, no package - no instances allowed
            max_allowed := 0;
            
            -- Build result JSON for user without package
            result := json_build_object(
                'can_create', false,
                'current_instances', current_count,
                'max_instances', max_allowed,
                'package_name', null,
                'package_display_tr', 'Paket Yok',
                'package_display_en', 'No Package'
            );
            
            RETURN result;
        END IF;
    END IF;

    -- User has a package
    max_allowed := package_info.max_instances;

    -- Build result JSON
    result := json_build_object(
        'can_create', current_count < max_allowed,
        'current_instances', current_count,
        'max_instances', max_allowed,
        'package_name', package_info.name,
        'package_display_tr', package_info.display_name_tr,
        'package_display_en', package_info.display_name_en
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_instance_limit(UUID) TO authenticated;
