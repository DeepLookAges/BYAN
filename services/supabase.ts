
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://logsjljdauxenwiuzaqh.supabase.co';
const supabaseKey = 'sb_publishable_c6YYnK3sHc3mnFQKZ2NTSQ_QygeL_5k';

export const supabase = createClient(supabaseUrl, supabaseKey);
