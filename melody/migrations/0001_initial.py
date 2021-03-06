# Generated by Django 3.1.2 on 2020-10-08 20:33

from django.conf import settings
from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Melody',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notes', models.JSONField()),
                ('bpm', models.IntegerField()),
                ('aimodel', models.CharField(max_length=200)),
                ('score', models.IntegerField(default=0)),
                ('date_created', models.DateTimeField(default=django.utils.timezone.now)),
                ('person', models.ManyToManyField(related_name='melodies', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
