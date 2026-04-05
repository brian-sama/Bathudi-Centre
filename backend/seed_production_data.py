import os
import django
import sys

# Add your project to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bathuditraining2center.settings')
django.setup()

from core.models import TeamMember, DirectorMessage, NewsPost, Course
from django.core.files.base import ContentFile

def seed_production_data():
    print("🚀 Seeding production data from SQL dump...")

    # 1. Team Members
    team_members_data = [
        {
            'name': 'Ignatia Sekonyela',
            'position': 'CEO and Founder',
            'email': 'info@bathudi.co.za',
            'phone': '+27 68 917 6294',
            'order': 1,
        },
        {
            'name': 'Michael More',
            'position': 'Senior Technical Trainer',
            'email': 'michael@bathudi.co.za',
            'order': 2,
        },
        {
            'name': 'Kearabetswe Sekonyela',
            'position': 'Communications Manager',
            'email': 'kearabetswe@bathudi.co.za',
            'order': 3,
        },
        {
            'name': 'Bongeka Ntiemeza',
            'position': 'Assistant Trainer',
            'email': 'bongeka@bathudi.co.za',
            'order': 4,
        }
    ]

    for member_data in team_members_data:
        member, created = TeamMember.objects.get_or_create(
            name=member_data['name'],
            defaults={
                'position': member_data['position'],
                'email': member_data.get('email', ''),
                'phone': member_data.get('phone', ''),
                'order': member_data['order'],
                'is_active': True
            }
        )
        if created:
            print(f"✅ Created Team Member: {member.name}")
        else:
            print(f"ℹ️ Team Member {member.name} already exists.")

    # 2. Director's Message
    director_message, created = DirectorMessage.objects.get_or_create(
        quote='WELCOME TO BATHUDI!!!!',
        defaults={
            'is_active': True,
            'video_url': 'https://www.youtube.com/watch?v=LXb3EKWsInQ',  # Example placeholder video
        }
    )
    if created:
        print(f"✅ Created Director message.")
    else:
        print(f"ℹ️ Director message already exists.")

    # 3. News Posts
    news_posts = [
        {
            'title': 'New Week!!',
            'preview_text': 'Join Us for a week full of learning and gaining industrial experience only at BaThUdi AuToMoTiVe!!!',
            'content': "Our workshop continues this week with students working on real-world projects, gaining the hands-on experience that sets skilled professionals apart.\r\n\r\nWhat's Happening This Week\r\nLive Projects: Students are actively working on client deliverables, applying classroom knowledge to real requirements\r\n\r\nMentorship Sessions: Industry professionals on-site to guide, review, and share insights\r\n\r\nCollaborative Environment: Work alongside peers, solve problems together, and build your",
            'is_published': True
        },
        {
            'title': 'From Learning to Doing: Students in Action',
            'preview_text': 'Real experience, real results—see how our workshop is preparing students for the industry',
            'content': "Theory teaches you the rules. Experience teaches you the game.\r\n\r\nThis week, our workshop students are stepping beyond textbooks and into the real work that shapes careers. From troubleshooting live code to meeting client requirements, they're building more than projects—they're building professional instincts.\r\n\r\nReady to Gain Real Experience?\r\nWhether you're a current student or looking to start, the workshop is where you build skills that matter.\r\n\r\nGet in touch to learn more about upcoming sessions.",
            'is_published': True
        }
    ]

    for post_data in news_posts:
        post, created = NewsPost.objects.get_or_create(
            title=post_data['title'],
            defaults=post_data
        )
        if created:
            print(f"✅ Created News Post: {post.title}")
        else:
            print(f"ℹ️ News Post '{post.title}' already exists.")

    print("\n🎉 Seeding completed successfully!")

if __name__ == '__main__':
    seed_production_data()
