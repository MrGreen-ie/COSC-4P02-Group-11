import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Link, IconButton, Rating } from '@mui/material';
import { AutoAwesome, Speed, DesignServices, Bolt, Facebook, Twitter, LinkedIn, Instagram } from '@mui/icons-material';
import TranslatedText from '../components/TranslatedText';

function Home() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', color: 'black' }}>
      
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #8B0000, #FF4C4C)',
          py: { xs: 8, md: 12 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 4,
          width: '100%',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'row-reverse', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            p: 3, 
            width: '100%', 
            maxWidth: '1400px',
          }}
        >
          {/* Image */}
          <Box sx={{ flexShrink: 0, marginLeft: 'auto' }}>
            <img 
              style={{ width: 450, height: 450 }} 
              src="src/assests/header.png"
              alt="AI Copywriting"
            />
          </Box>
          
          {/* Hero Text */}
          <Box sx={{ flexGrow: 1, maxWidth: '500px' }}>
            <Typography variant="h2" fontWeight="bold" gutterBottom color="white">
              <TranslatedText>AI-Powered Newsletter Writing Made Easy</TranslatedText>
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, mb: 3 }} color="white">
              <TranslatedText>Join us and write high-quality AI-powered newsletters to boost your business.</TranslatedText>
            </Typography>
            <Button
              component="a"
              href="/register"
              variant="contained"
              sx={{
                backgroundColor: 'red',
                color: 'white',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                fontSize: '1.2rem',
                borderRadius: '25px',
                '&:hover': {
                  backgroundColor: '#ff6666',
                },
              }}
            >
              <TranslatedText>Start Writing—For Free</TranslatedText>
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', backgroundColor: '#f9f9f9', py: 8, textAlign: 'center' }}>
        <Box sx={{ width: '80%' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            <TranslatedText>Why Marketers Love Us</TranslatedText>
          </Typography>
          <br />

          <Grid container spacing={4} justifyContent="center">
            {[
              { icon: <AutoAwesome sx={{ fontSize: 50, color: 'black' }} />, title: <TranslatedText>AI-Powered Writing</TranslatedText>, text: <TranslatedText>Generate engaging content effortlessly.</TranslatedText> },
              { icon: <Speed sx={{ fontSize: 50, color: 'black' }} />, title: <TranslatedText>Lightning Fast</TranslatedText>, text: <TranslatedText>Create marketing copy in seconds.</TranslatedText> },
              { icon: <DesignServices sx={{ fontSize: 50, color: 'black' }} />, title: <TranslatedText>Custom Templates</TranslatedText>, text: <TranslatedText>Pre-built templates for various needs.</TranslatedText> },
              { icon: <Bolt sx={{ fontSize: 50, color: 'black' }} />, title: <TranslatedText>SEO Optimized</TranslatedText>, text: <TranslatedText>Boost rankings with AI-generated copy.</TranslatedText> },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ textAlign: 'center', p: 3, boxShadow: 3, borderRadius: 2, background: 'transparent', border: '2px solid black' }}>
                  <CardContent>
                    {feature.icon}
                    <Typography variant="h6" fontWeight="bold" mt={2}>
                      {feature.title}
                    </Typography>
                    <Typography sx={{ opacity: 0.7 }}>{feature.text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Share Your Newsletter Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8, px: 4, backgroundColor: '#fff', width: '100%' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            maxWidth: '1200px', 
            width: '100%' 
          }}
        >
          <Box sx={{ flexGrow: 1, maxWidth: '500px' }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              <TranslatedText>Send Your Newsletter to Social Media & Email</TranslatedText>
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              <TranslatedText>Instantly share your AI-generated newsletters on Twitter, Facebook, Instagram, and via Email to reach a wider audience.</TranslatedText>
            </Typography>
          </Box>
          <Box sx={{ flexShrink: 0, marginLeft: { md: 'auto' }, mt: { xs: 4, md: 0 } }}>
            <img 
              src="src/assests/socialmedia.jpg"
              alt="Share Newsletter"
              style={{ width: 250, height: 200 }}
            />
          </Box>
        </Box>
      </Box>

      {/* Customer Reviews Section */}
      <Box sx={{ backgroundColor: '#f9f9f9', py: 8, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          <TranslatedText>What Our Customers Say</TranslatedText>
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            { name: <TranslatedText>John Doe</TranslatedText>, review: <TranslatedText>I love the newsletter! It saves me so much time.</TranslatedText>, rating: 5 },
            { name: <TranslatedText>Jane Smith</TranslatedText>, review: <TranslatedText>Fantastic tool for creating high-quality content.</TranslatedText>, rating: 5 },
            { name: <TranslatedText>Emily Johnson</TranslatedText>, review: <TranslatedText>This has improved my email marketing significantly!</TranslatedText>, rating: 5 },
          ].map((customer, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2, textAlign: 'center' }}>
                <CardContent>
                  <Rating value={customer.rating} readOnly />
                  <Typography variant="body1" fontStyle="italic" mt={2}>
                    "{customer.review}"
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" mt={1}>
                    - {customer.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Footer */}
      <Box sx={{ background: 'linear-gradient(135deg, #8B0000, #FF4C4C)', py: 4, textAlign: 'center' }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={4}><Typography variant="h6" fontWeight="bold"><TranslatedText>Quick Links</TranslatedText></Typography>
            <Link href="#"><TranslatedText>Home</TranslatedText></Link><br />
            <Link href="#"><TranslatedText>Features</TranslatedText></Link><br />
            <Link href="#"><TranslatedText>Pricing</TranslatedText></Link><br />
            <Link href="#"><TranslatedText>Contact</TranslatedText></Link>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, opacity: 0.7 }}>
          <Typography variant="body2"><TranslatedText>© {new Date().getFullYear()} AI Powered Newsletter. All rights reserved.</TranslatedText></Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default Home;
