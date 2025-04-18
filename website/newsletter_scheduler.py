from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import pytz
import logging

from .models import ScheduledNewsletter
from . import db

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_scheduled_newsletters():
    """
    Process scheduled newsletters that are due to be sent.
    This function is called by the scheduler every minute.
    """
    now = datetime.utcnow()
    newsletters_to_process = ScheduledNewsletter.query.filter(
        ScheduledNewsletter.scheduled_time <= now,
        ScheduledNewsletter.status == "scheduled"
    ).all()

    for newsletter in newsletters_to_process:
        try:
            # Send the email
            send_email(
                recipient=newsletter.recipient_email,
                subject=f"Newsletter #{newsletter.newsletter_id}",
                body="This is the content of the newsletter."  # Replace with actual content
            )

            # Update the status to 'sent'
            newsletter.status = 'sent'
        except Exception as e:
            # Update the status to 'failed' and log the error
            newsletter.status = 'failed'
            newsletter.error_message = str(e)

        db.session.commit()

def init_newsletter_scheduler(app):
    """
    Initialize the scheduler to run the process_scheduled_newsletters function every minute.
    """
    with app.app_context():
        scheduler = BackgroundScheduler()
        scheduler.add_job(
            func=process_scheduled_newsletters,
            trigger=IntervalTrigger(minutes=1),
            id='process_scheduled_newsletters',
            name='Process scheduled newsletters',
            replace_existing=True
        )
        scheduler.start()
        logger.info("Scheduler started for processing scheduled newsletters")
        return scheduler