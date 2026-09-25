"""Materialize a safe env-file marker while keeping secrets in host environment settings."""
import os
from pathlib import Path
from dotenv import load_dotenv


def prepare():
    if os.environ.get('RENDER'):
        missing_host = [name for name in ('MONGO_URL', 'DB_NAME', 'CORS_ORIGINS') if not os.environ.get(name, '').strip()]
        if missing_host:
            raise SystemExit('Configure Render environment settings (development defaults are not used): ' + ', '.join(missing_host))
    env_file = Path(__file__).parent / '.env'
    if not env_file.exists():
        # Never copy credentials into a generated file or alter an existing developer .env.
        env_file.write_text('# Runtime values are supplied by the hosting environment.\n')
    load_dotenv(env_file.with_name('.env.local'), override=False)
    load_dotenv(env_file, override=False)
    missing = [name for name in ('MONGO_URL', 'DB_NAME', 'CORS_ORIGINS') if not os.environ.get(name, '').strip()]
    if missing:
        raise SystemExit('Build stopped. Configure required backend environment variables: ' + ', '.join(missing))
    print('KisanGyan backend environment is ready. Existing files and secrets remain unchanged.')


if __name__ == '__main__':
    prepare()