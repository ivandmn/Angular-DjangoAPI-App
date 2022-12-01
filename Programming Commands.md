# General Programming Comands

## Technologies
  - [Git](#git)
  - [Django](#django)
  - [Angular](#angular)
  - [Laravel](#laravel)

## Git

**Configuration Git**
```bash
git config --global user.name 'Name'
git config --global user.email 'Email'
```
**Start repository**
```bash
git init
```
**Add files to repository**
```bash
git add *
```
**Commit repository**
```bash
git commit -m "message"
```
**Connect to Remote Repository**
```bash
git remote add origin "remote-repository"
```
**Clone Repository**
```bash
git clone "remote/local-repository"
```
**Push Repository**
```bash
git push -u origin master
```
**Pull Repository**
```bash
git pull
```
**Check Status**
```bash
git status
```

## Django
**Install django**
```bash
python -m pip install Django
```
**Create django project**
```bash
python -m django startproject "project_name"
```
**Create app**
```bash
python -m django startapp "app_name"
```
**Add models of existing database**
```bash
python manage.py inspectdb > app/models.py
```
**Make migrations**
```bash
python manage.py makemigrations
```
**Migrate**
```bash
python manage.py migrate
```
**Create superuser**
```bash
python manage.py createsuperuser
```
**Open Server**
```bash
python manage.py runserver
```

## Angular
**Install Angular**
```bash
npm install -g @angular/cli
```
**Create angular project**
```bash
ng new project_name
```
**Generate Component**
```bash
ng generate component "component_name"
```
**Generate Service**
```bash
ng generate service "service_name"
```
**Generate Pipe**
```bash
ng generate pipe "pipe_name"
```
**Generate Interceptor**
```bash
ng generate interceptor "interceptor_name"
```
**Generate Model**
```bash
ng generate class "class_name" --type=model
```
**Generate Guard**
```bash
ng generate guard "guard_name"
```
**Open server**
```bash
ng serve --open
```
**Buil Project**
```bash
ng build --configuration production --aot --build-optimizer
```
## Laravel
**Install laravel**
```bash
composer global require laravel/installer
```
**Create New Project**
```bash
laravel new project
```
**Open server**
```bash
php artisan serve
```
