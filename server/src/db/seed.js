import supabase from '../config/database.js';
import bcrypt from 'bcrypt';

/**
 * Seed initial agents into the database
 * These agents match the client's UI expectations
 */
export async function seedAgents() {
    console.log('🌱 Seeding agents...');

    const agents = [
        {
            name: 'Sales Agent',
            description: 'Monitors B2B platforms and detects new RFP opportunities',
            agent_type: 'sales',
            color: 'from-teal-500 to-teal-600',
            status: 'active',
            progress: 75,
            ai_model: 'gpt-4',
            system_prompt: 'You are a sales agent specialized in detecting and analyzing RFP opportunities from B2B platforms.'
        },
        {
            name: 'Technical Agent',
            description: 'Analyzes technical specifications and matches them with product catalog',
            agent_type: 'technical',
            color: 'from-blue-500 to-blue-600',
            status: 'active',
            progress: 60,
            ai_model: 'gpt-4',
            system_prompt: 'You are a technical agent specialized in analyzing product specifications and matching them with catalog items.'
        },
        {
            name: 'Pricing Agent',
            description: 'Calculates competitive pricing based on materials, labor, and market data',
            agent_type: 'pricing',
            color: 'from-purple-500 to-purple-600',
            status: 'active',
            progress: 85,
            ai_model: 'gpt-4',
            system_prompt: 'You are a pricing agent specialized in calculating competitive prices for manufacturing products.'
        },
        {
            name: 'Report Agent',
            description: 'Generates professional PDF proposals ready for submission',
            agent_type: 'report',
            color: 'from-emerald-500 to-emerald-600',
            status: 'idle',
            progress: 100,
            ai_model: 'gpt-4',
            system_prompt: 'You are a report agent specialized in generating professional RFP response documents.'
        },
        {
            name: 'Master Agent',
            description: 'Orchestrates all agents and manages the end-to-end workflow',
            agent_type: 'master',
            color: 'from-orange-500 to-orange-600',
            status: 'active',
            progress: 40,
            ai_model: 'gpt-4',
            system_prompt: 'You are the master orchestrator managing the entire RFP response workflow.'
        }
    ];

    for (const agent of agents) {
        const { data, error } = await supabase
            .from('agents')
            .upsert(agent, { onConflict: 'agent_type' });

        if (error) {
            console.error(`Error seeding ${agent.name}:`, error.message);
        } else {
            console.log(`✅ Seeded ${agent.name}`);
        }
    }
}

/**
 * Seed demo user
 */
export async function seedDemoUser() {
    console.log('🌱 Seeding demo user...');

    const demoUser = {
        email: 'demo@rfp-automation.com',
        name: 'Demo User',
        role: 'admin',
        password_hash: await bcrypt.hash('demo123', 10)
    };

    const { data, error } = await supabase
        .from('users')
        .upsert(demoUser, { onConflict: 'email' })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            console.log('ℹ️  Demo user already exists');
            // Fetch existing user
            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('email', demoUser.email)
                .single();
            return existingUser;
        } else {
            console.error('Error seeding demo user:', error.message);
            return null;
        }
    }

    console.log('✅ Demo user created');
    return data;
}

/**
 * Seed sample RFPs
 */
export async function seedRFPs(userId) {
    console.log('🌱 Seeding sample RFPs...');

    const rfps = [
        {
            user_id: userId,
            title: 'Industrial Pump System RFP',
            source: 'ThomasNet',
            website: 'thomasnet.com/rfq/12847',
            source_url: 'https://thomasnet.com/rfq/12847',
            submission_date: '2025-12-15',
            detected_date: '2025-12-08T10:00:00Z',
            status: 'submitted',
            match_score: 94,
            specs: [
                'Flow Rate: 500 GPM minimum',
                'Maximum Pressure: 150 PSI',
                'Material: Stainless Steel 316',
                'Motor: 25 HP, 3-phase, 480V',
                'Certifications: API 610, ISO 9001'
            ],
            products: [
                { sku: 'SKU-P2847', name: 'Industrial Centrifugal Pump - Heavy Duty', compatibility: 94 },
                { sku: 'SKU-P2901', name: 'High-Flow Pump System with Controller', compatibility: 88 }
            ],
            pricing: {
                unitPrice: 2847,
                quantity: 500,
                totalPrice: 1423500,
                leadTime: '12-14 weeks'
            }
        },
        {
            user_id: userId,
            title: 'Hydraulic Valve Assembly',
            source: 'Alibaba',
            website: 'alibaba.com/inquiry/HVA-2025-001',
            source_url: 'https://alibaba.com/inquiry/HVA-2025-001',
            submission_date: '2025-12-12',
            detected_date: '2025-12-07T14:30:00Z',
            status: 'processed',
            match_score: 88,
            specs: [
                'Valve Type: Directional Control',
                'Port Size: 3/4 inch NPT',
                'Operating Pressure: 3000 PSI',
                'Temperature Range: -20°F to 200°F',
                'Seal Material: Viton'
            ],
            products: [
                { sku: 'SKU-V1842', name: 'Hydraulic Directional Valve - 4-Way', compatibility: 88 },
                { sku: 'SKU-V1956', name: 'Heavy Duty Valve Assembly Kit', compatibility: 82 }
            ],
            pricing: {
                unitPrice: 485,
                quantity: 1000,
                totalPrice: 485000,
                leadTime: '8-10 weeks'
            }
        },
        {
            user_id: userId,
            title: 'Custom Bearing Manufacturing',
            source: 'Made-in-China',
            website: 'made-in-china.com/rfq/bearing-2025',
            source_url: 'https://made-in-china.com/rfq/bearing-2025',
            submission_date: '2025-12-18',
            detected_date: '2025-12-07T09:15:00Z',
            status: 'processed',
            match_score: 76,
            specs: [
                'Bearing Type: Tapered Roller',
                'Bore Diameter: 100mm',
                'Outer Diameter: 180mm',
                'Width: 46mm',
                'Load Rating: 250kN radial'
            ],
            products: [
                { sku: 'SKU-B4521', name: 'Precision Tapered Roller Bearing', compatibility: 76 },
                { sku: 'SKU-B4638', name: 'Industrial Heavy-Load Bearing', compatibility: 71 }
            ],
            pricing: {
                unitPrice: 124,
                quantity: 2500,
                totalPrice: 310000,
                leadTime: '6-8 weeks'
            }
        },
        {
            user_id: userId,
            title: 'Precision Gearbox Components',
            source: 'ThomasNet',
            website: 'thomasnet.com/rfq/15293',
            source_url: 'https://thomasnet.com/rfq/15293',
            submission_date: '2025-12-20',
            detected_date: '2025-12-06T16:45:00Z',
            status: 'pending',
            match_score: 82,
            specs: [
                'Gear Ratio: 10:1',
                'Input Speed: 1800 RPM',
                'Torque Capacity: 500 lb-ft',
                'Housing Material: Cast Iron',
                'Lubrication: Oil Bath'
            ],
            products: [
                { sku: 'SKU-G7821', name: 'Industrial Gearbox Assembly', compatibility: 82 },
                { sku: 'SKU-G7945', name: 'Precision Gear Reducer Unit', compatibility: 79 }
            ],
            pricing: {
                unitPrice: 1650,
                quantity: 300,
                totalPrice: 495000,
                leadTime: '10-12 weeks'
            }
        },
        {
            user_id: userId,
            title: 'Industrial Motor Housing',
            source: 'GlobalSpec',
            website: 'globalspec.com/rfq/motor-housing',
            source_url: 'https://globalspec.com/rfq/motor-housing',
            submission_date: '2025-12-10',
            detected_date: '2025-12-06T11:20:00Z',
            status: 'submitted',
            match_score: 91,
            specs: [
                'Frame Size: NEMA 256T',
                'Material: Aluminum Alloy',
                'Finish: Powder Coated',
                'Mounting: Foot Mounted',
                'IP Rating: IP65'
            ],
            products: [
                { sku: 'SKU-M3472', name: 'NEMA Standard Motor Housing', compatibility: 91 },
                { sku: 'SKU-M3589', name: 'Heavy Duty Motor Enclosure', compatibility: 85 }
            ],
            pricing: {
                unitPrice: 385,
                quantity: 750,
                totalPrice: 288750,
                leadTime: '7-9 weeks'
            }
        }
    ];

    for (const rfp of rfps) {
        const { data, error } = await supabase
            .from('rfps')
            .insert(rfp);

        if (error) {
            console.error(`Error seeding RFP "${rfp.title}":`, error.message);
        } else {
            console.log(`✅ Seeded RFP: ${rfp.title}`);
        }
    }
}

/**
 * Seed sample reports
 */
export async function seedReports(userId) {
    console.log('🌱 Seeding sample reports...');

    // First, get RFP IDs
    const { data: rfps } = await supabase
        .from('rfps')
        .select('id, title')
        .eq('user_id', userId)
        .limit(4);

    if (!rfps || rfps.length === 0) {
        console.log('No RFPs found to create reports for');
        return;
    }

    const reportsSummaries = [
        {
            clientName: 'ThomasNet Buyer #12847',
            totalValue: 1423500,
            products: ['SKU-P2847: Industrial Centrifugal Pump', 'SKU-P2901: High-Flow Controller'],
            deliveryTimeline: '12-14 weeks from PO receipt',
            keyHighlights: [
                '94% specification match with existing product line',
                'Full API 610 and ISO 9001 compliance included',
                'Volume discount applied: 15% off for 500+ units',
                'In-house manufacturing eliminates supply chain delays',
                'Technical support and warranty coverage included'
            ]
        },
        {
            clientName: 'Alibaba Enterprise Buyer',
            totalValue: 485000,
            products: ['SKU-V1842: 4-Way Directional Valve', 'SKU-V1956: Valve Assembly Kit'],
            deliveryTimeline: '8-10 weeks from PO receipt',
            keyHighlights: [
                '88% compatibility with requested specifications',
                'Viton seals included for high-temperature applications',
                'Certified for 3000 PSI operating pressure',
                'Bulk pricing available for 1000+ unit orders',
                'Quality inspection reports provided with shipment'
            ]
        },
        {
            clientName: 'Made-in-China Platform Request',
            totalValue: 310000,
            products: ['SKU-B4521: Precision Tapered Roller Bearing', 'SKU-B4638: Heavy-Load Bearing'],
            deliveryTimeline: '6-8 weeks from PO receipt',
            keyHighlights: [
                'Custom bearing dimensions available upon request',
                'Load rating exceeds 250kN radial capacity',
                'Precision manufacturing tolerances: ±0.001mm',
                'Extended warranty program for industrial applications',
                'Fast-track production available for urgent orders'
            ]
        },
        {
            clientName: 'GlobalSpec Enterprise Client',
            totalValue: 288750,
            products: ['SKU-M3472: NEMA Standard Housing', 'SKU-M3589: Heavy Duty Enclosure'],
            deliveryTimeline: '7-9 weeks from PO receipt',
            keyHighlights: [
                '91% match with NEMA 256T specifications',
                'IP65 rated for outdoor industrial use',
                'Powder-coated finish in custom colors available',
                'Aluminum alloy construction for weight reduction',
                'Foot mounted configuration with standard bolt pattern'
            ]
        }
    ];

    for (let i = 0; i < Math.min(rfps.length, reportsSummaries.length); i++) {
        const rfp = rfps[i];
        const reportData = {
            rfp_id: rfp.id,
            user_id: userId,
            rfp_name: `${rfp.title} Response`,
            summary: reportsSummaries[i],
            match_score: [94, 88, 76, 91][i],
            status: i < 3 ? 'completed' : 'pending',
            content: `This is a detailed RFP response for ${rfp.title}.`
        };

        const { error } = await supabase
            .from('reports')
            .insert(reportData);

        if (error) {
            console.error(`Error seeding report for "${rfp.title}":`, error.message);
        } else {
            console.log(`✅ Seeded report: ${reportData.rfp_name}`);
        }
    }
}

/**
 * Seed default user settings
 */
export async function seedUserSettings(userId) {
    console.log('🌱 Seeding user settings...');

    const settings = {
        user_id: userId,
        rfp_source_urls: [
            'thomasnet.com',
            'alibaba.com',
            'made-in-china.com',
            'globalspec.com'
        ],
        auto_scan_enabled: true,
        scan_interval_hours: 6,
        match_threshold: 70,
        auto_response_enabled: false
    };

    const { data, error } = await supabase
        .from('user_settings')
        .upsert(settings, { onConflict: 'user_id' });

    if (error) {
        console.error('Error seeding user settings:', error.message);
    } else {
        console.log('✅ Seeded user settings');
    }
}

/**
 * Main seed function
 */
async function seed() {
    try {
        console.log('🚀 Starting database seeding...\n');

        // Seed agents first (no dependencies)
        await seedAgents();

        // Seed demo user
        const demoUser = await seedDemoUser();

        if (demoUser) {
            // Seed data that depends on user
            await seedRFPs(demoUser.id);
            await seedReports(demoUser.id);
            await seedUserSettings(demoUser.id);
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📝 Demo account credentials:');
        console.log('   Email: demo@rfp-automation.com');
        console.log('   Password: demo123\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }

    process.exit(0);
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seed();
}

export default seed;
