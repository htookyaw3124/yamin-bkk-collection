# 1. Copy the nginx config to your host nginx

sudo cp nginx/default.conf /etc/nginx/sites-available/yaminbkk.conf
sudo ln -s /etc/nginx/sites-available/yaminbkk.conf /etc/nginx/sites-enabled/

# 2. Get SSL cert first (comment out the 443 server block in the config temporarily)

sudo certbot certonly --webroot -w /var/www/certbot -d yaminbkk.truthtech.website

# OR stop nginx briefly:

# sudo systemctl stop nginx && sudo certbot certonly --standalone -d yaminbkk.truthtech.website && sudo systemctl start nginx

# 3. Start Docker containers

docker compose up -d --build

# 4. Reload nginx

sudo nginx -t && sudo systemctl reload nginx


# 1. Create the database
sudo -u postgres psql -c "CREATE DATABASE yamin_bkk_collection;"

# 2. Run Prisma migrations inside the API container
docker compose exec api npx prisma migrate deploy

# 3. Seed the database (categories, etc.)
docker compose exec api npx prisma db seed
