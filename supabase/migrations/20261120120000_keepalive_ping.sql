-- Keep-alive: Lovable Cloud pauses a backend after ~7 days with no activity.
-- The hourly fw-rate-events-cleanup job already keeps the database busy; this
-- daily ping adds outside traffic too. It loads the live /blog page, whose
-- server loader reads posts through the Supabase API, so no key is stored here.
-- Applied to the live database on 20 Nov 2026 (tested: 200, posts listed).
-- When the site moves to futurewiseapp.org, change the URL (re-run this file).
-- To stop it: select cron.unschedule('fw-keepalive-ping');
do $$
begin
  create extension if not exists pg_cron;
  create extension if not exists pg_net;
  perform cron.unschedule(jobid) from cron.job where jobname = 'fw-keepalive-ping';
  perform cron.schedule(
    'fw-keepalive-ping',
    '43 6 * * *',
    $job$select net.http_get(url := 'https://futurewisee.lovable.app/blog', timeout_milliseconds := 30000)$job$
  );
exception when others then
  raise notice 'pg_cron/pg_net not available, keep-alive ping not scheduled: %', sqlerrm;
end
$$;
