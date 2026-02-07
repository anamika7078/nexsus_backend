const Blog = require('../models/Blog');

const sampleBlogs = [
    {
        title: "The Rise of AI-Powered Cyber Attacks",
        slug: "the-rise-of-ai-powered-cyber-attacks",
        category: "Threat Intelligence",
        excerpt: "How artificial intelligence is reshaping the threat landscape and what businesses need to do to stay ahead of automated attacks.",
        content: `
            <p>As we move further into a decade defined by technological convergence, the weaponization of Artificial Intelligence has shifted from a theoretical concern to a daily reality for security professionals worldwide.</p>

            <h2>The Automation of Vulnerability Research</h2>
            <p>In the past, identifying zero-day vulnerabilities was a labor-intensive process requiring human expertise and weeks of manual code review. Modern adversarial AI can now scan massive codebases in seconds, identifying complex logic flaws and potential entry points with superhuman precision.</p>

            <h2>Deepfake Social Engineering</h2>
            <p>Perhaps more concerning is the use of generative AI to create hyper-realistic phishing campaigns. Using voice cloning and video synthesis, attackers are now impersonating executives in real-time meetings to authorize fraudulent wire transfers and data exfiltration.</p>

            <h2>Nexsus Defensive Response</h2>
            <p>At Nexsus, we counter AI with AI. Our proprietary Neural Sentinel platform uses unsupervised learning to detect behavioral anomalies that bypass traditional signature-based detection systems.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
        author: "Sarah Connor",
        status: "published"
    },
    {
        title: "Zero Trust Architecture: A Comprehensive Guide",
        slug: "zero-trust-architecture-comprehensive-guide",
        category: "Cybersecurity",
        excerpt: "Moving beyond perimeter security. Why 'never trust, always verify' is becoming the new standard for enterprise security.",
        content: `
            <p>The perimeter is dead. In a world of remote work and cloud-native applications, the traditional castle-and-moat security model has become a liability rather than an asset.</p>

            <h2>Principles of Zero Trust</h2>
            <p>Zero Trust is not a specific product, but a strategic framework built on one central tenet: Never trust, always verify. Every access request, whether it comes from inside or outside the network, must be fully authenticated and authorized.</p>

            <h3>Core Principles:</h3>
            <ul>
                <li>Continuous verification based on all available data points</li>
                <li>Least privilege access principle (JIT/JEA)</li>
                <li>Assume breach mentality</li>
                <li>Micro-segmentation of critical assets</li>
            </ul>

            <h2>Implementation Challenges</h2>
            <p>Adopting Zero Trust often requires a significant cultural shift. It moves security from the IT department into the very fabric of business operations, requiring every user to participate in the defensive posture of the organization.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200",
        author: "John Rees",
        status: "published"
    },
    {
        title: "Remote Work Security Best Practices",
        slug: "remote-work-security-best-practices",
        category: "Security Awareness",
        excerpt: "Securing the distributed workforce. Essential tools and protocols for maintaining data integrity outside the office.",
        content: `
            <p>As the lines between domestic and professional environments continue to blur, the security of the remote workforce has become the primary battleground for enterprise data protection.</p>

            <h2>The Home Office Perimeter</h2>
            <p>Securing a distributed workforce requires a comprehensive approach that combines technical controls with active user education. Traditional VPNs are no longer sufficient on their own.</p>

            <h2>Essential Security Measures</h2>
            <h3>Endpoint Security</h3>
            <p>Ensure all remote devices have managed EDR solutions installed and active.</p>

            <h3>MFA Enforcement</h3>
            <p>Multi-factor authentication is the single most effective deterrent against credential theft.</p>

            <h3>Secure Wi-Fi</h3>
            <p>Employee home networks must be configured with WPA3 and unique, complex passwords.</p>

            <h3>Shadow IT</h3>
            <p>Monitor and restrict the use of unauthorized SaaS applications for business data.</p>

            <h2>Active Monitoring</h2>
            <p>Organizations must implement telemetry gathering that respects privacy while identifying high-risk behaviors. Behavioral analytics can flag "impossible travel" logins and unusual data access patterns that indicate a compromised remote node.</p>
        `,
        featuredImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200",
        author: "Elena Fisher",
        status: "published"
    }
];

const seedBlogs = async () => {
    try {
        // Check if blogs already exist
        const existingBlogs = await Blog.count();

        if (existingBlogs > 0) {
            console.log('✅ Blogs already exist, skipping seed');
            return;
        }

        // Create sample blogs
        await Blog.bulkCreate(sampleBlogs);
        console.log('✅ Sample blogs created successfully');
    } catch (error) {
        console.error('❌ Error seeding blogs:', error);
    }
};

module.exports = seedBlogs;
