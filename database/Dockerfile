# Database Dockerfile
FROM ubuntu:latest

# Install MySQL
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server

# Create directories
RUN mkdir -p /var/lib/mysql /var/run/mysqld && \
    chown -R mysql:mysql /var/lib/mysql /var/run/mysqld && \
    chmod 777 /var/run/mysqld

# Create directory for SQL files
RUN mkdir -p /docker-entrypoint-initdb.d


EXPOSE 3306

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=admin
ENV MYSQL_DATABASE=ballershuffleschema
ENV MYSQL_USER=IdanSQL
ENV MYSQL_PASSWORD=Idan27091999!
# Volume for persistent data
# Volume for persistent data
VOLUME ["/var/lib/mysql"]

# Add MySQL init script
RUN echo "#!/bin/bash\n\
service mysql start\n\
mysql -u root -e \"CREATE USER IF NOT EXISTS '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';\"\n\
mysql -u root -e \"CREATE DATABASE IF NOT EXISTS $MYSQL_DATABASE;\"\n\
mysql -u root -e \"GRANT ALL PRIVILEGES ON $MYSQL_DATABASE.* TO '$MYSQL_USER'@'%';\"\n\
mysql -u root -e \"FLUSH PRIVILEGES;\"\n\
if [ -d \"/docker-entrypoint-initdb.d\" ]; then\n\
    for file in /docker-entrypoint-initdb.d/*.sql; do\n\
        if [ -f \"\$file\" ]; then\n\
            echo \"Executing SQL file: \$file\"\n\
            mysql -u root $MYSQL_DATABASE < \"\$file\"\n\
        fi\n\
    done\n\
fi\n\
tail -f /var/log/mysql/error.log" > /docker-entrypoint.sh && \
chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]