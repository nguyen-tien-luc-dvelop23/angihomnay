/**
 * Food Edition Item & Case Database
 */

const RARITY_TYPES = {
    'mil-spec': {
        key: 'mil-spec',
        name: 'Món Phổ Thông (Xanh Lam)',
        color: '#4b69ff',
        glow: 'rgba(75, 105, 255, 0.6)',
        probability: 79.92
    },
    'restricted': {
        key: 'restricted',
        name: 'Món Đặc Biệt (Tím)',
        color: '#8847ff',
        glow: 'rgba(136, 71, 255, 0.6)',
        probability: 15.98
    },
    'classified': {
        key: 'classified',
        name: 'Món Thượng Hạng (Hồng)',
        color: '#d32ce6',
        glow: 'rgba(211, 44, 230, 0.65)',
        probability: 3.20
    },
    'covert': {
        key: 'covert',
        name: 'Món Cực Phẩm (Đỏ)',
        color: '#eb4b4b',
        glow: 'rgba(235, 75, 75, 0.75)',
        probability: 0.64
    },
    'gold': {
        key: 'gold',
        name: '★ Món Huyền Thoại (Vàng Hoàng Gia) ★',
        color: '#ffd700',
        glow: 'rgba(255, 215, 0, 0.9)',
        probability: 0.26
    }
};

const WEAR_CONDITIONS = [
    { name: 'Mới Ra Lò (Nóng hổi 100%)', min: 0.00, max: 0.07 },
    { name: 'Còn Bốc Khói (Thơm phức)', min: 0.07, max: 0.15 },
    { name: 'Vừa Hâm Nóng (Ngon chuẩn vị)', min: 0.15, max: 0.38 },
    { name: 'Để Hơi Nguội (Ăn vẫn dính)', min: 0.38, max: 0.45 },
    { name: 'Cháy Cạnh Giòn Rụm (Đậm vị)', min: 0.45, max: 1.00 }
];

// Helper to generate food SVGs with sleek dark tactical icons
function getFoodSvg(iconType, color) {
    switch(iconType) {
        case 'noodle':
            return `<svg viewBox="0 0 100 100" class="food-svg-icon">
                <circle cx="50" cy="50" r="44" fill="#141721" stroke="${color}" stroke-width="2"/>
                <path d="M22 45 Q50 90 78 45" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
                <path d="M20 45 C20 40 80 40 80 45 Z" fill="${color}" opacity="0.3"/>
                <path d="M30 35 Q50 25 70 35" fill="none" stroke="#f1c40f" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M26 38 Q50 30 74 38" fill="none" stroke="#f1c40f" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="72" y1="20" x2="35" y2="60" stroke="#e67e22" stroke-width="3" stroke-linecap="round"/>
                <line x1="78" y1="20" x2="41" y2="60" stroke="#d35400" stroke-width="3" stroke-linecap="round"/>
            </svg>`;
        case 'bread':
            return `<svg viewBox="0 0 100 100" class="food-svg-icon">
                <circle cx="50" cy="50" r="44" fill="#141721" stroke="${color}" stroke-width="2"/>
                <path d="M15 50 C20 30 80 30 85 50 C80 70 20 70 15 50 Z" fill="#e67e22" opacity="0.3" stroke="${color}" stroke-width="3"/>
                <line x1="30" y1="42" x2="40" y2="58" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
                <line x1="45" y1="40" x2="55" y2="60" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
                <line x1="60" y1="42" x2="70" y2="58" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
                <circle cx="50" cy="50" r="4" fill="#2ecc71"/>
            </svg>`;
        case 'rice':
            return `<svg viewBox="0 0 100 100" class="food-svg-icon">
                <circle cx="50" cy="50" r="44" fill="#141721" stroke="${color}" stroke-width="2"/>
                <path d="M25 50 Q50 85 75 50 Z" fill="#34495e" stroke="${color}" stroke-width="3"/>
                <path d="M20 50 Q50 25 80 50 Z" fill="${color}" opacity="0.4"/>
                <circle cx="50" cy="42" r="8" fill="#f1c40f"/>
                <circle cx="50" cy="42" r="4" fill="#e67e22"/>
            </svg>`;
        case 'egg':
            return `<svg viewBox="0 0 100 100" class="food-svg-icon">
                <circle cx="50" cy="50" r="44" fill="#141721" stroke="${color}" stroke-width="2"/>
                <path d="M50 20 C32 20 28 50 28 65 C28 78 38 84 50 84 C62 84 72 78 72 65 C72 50 68 20 50 20 Z" fill="#ecf0f1" opacity="0.25" stroke="${color}" stroke-width="3"/>
                <path d="M40 50 L48 55 L44 63 L54 60 L50 72" fill="none" stroke="${color}" stroke-width="2"/>
            </svg>`;
        case 'pizza':
            return `<svg viewBox="0 0 100 100" class="food-svg-icon">
                <circle cx="50" cy="50" r="44" fill="#141721" stroke="${color}" stroke-width="2"/>
                <path d="M50 82 L20 30 Q50 18 80 30 Z" fill="${color}" opacity="0.3" stroke="${color}" stroke-width="3"/>
                <circle cx="45" cy="42" r="5" fill="#e74c3c"/>
                <circle cx="58" cy="52" r="4" fill="#e74c3c"/>
                <circle cx="42" cy="62" r="4" fill="#e74c3c"/>
            </svg>`;
        case 'chicken':
            return `<svg viewBox="0 0 100 100" class="food-svg-icon">
                <circle cx="50" cy="50" r="44" fill="#141721" stroke="${color}" stroke-width="2"/>
                <path d="M35 30 C55 15 75 35 65 55 C60 65 55 60 45 68 L35 78 Q30 80 28 75 Q28 68 35 65 Z" fill="#d35400" opacity="0.35" stroke="${color}" stroke-width="3"/>
                <circle cx="52" cy="40" r="6" fill="#f39c12"/>
            </svg>`;
        case 'hotpot':
            return `<svg viewBox="0 0 100 100" class="food-svg-icon">
                <circle cx="50" cy="50" r="44" fill="#141721" stroke="${color}" stroke-width="2"/>
                <path d="M20 52 Q50 85 80 52 Z" fill="#e74c3c" opacity="0.3" stroke="${color}" stroke-width="3"/>
                <line x1="14" y1="52" x2="86" y2="52" stroke="${color}" stroke-width="4"/>
                <path d="M35 38 Q38 25 40 18" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M50 38 Q53 25 50 15" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
                <path d="M65 38 Q68 25 62 18" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
            </svg>`;
        case 'sushi':
            return `<svg viewBox="0 0 100 100" class="food-svg-icon">
                <circle cx="50" cy="50" r="44" fill="#141721" stroke="${color}" stroke-width="2"/>
                <rect x="25" y="45" width="50" height="25" rx="10" fill="#ecf0f1" opacity="0.3" stroke="${color}" stroke-width="3"/>
                <path d="M22 45 Q50 35 78 45" fill="#e74c3c" stroke="${color}" stroke-width="3"/>
                <rect x="44" y="40" width="12" height="32" fill="#27ae60"/>
            </svg>`;
        case 'boba':
            return `<svg viewBox="0 0 100 100" class="food-svg-icon">
                <circle cx="50" cy="50" r="44" fill="#141721" stroke="${color}" stroke-width="2"/>
                <path d="M30 30 L38 80 Q50 85 62 80 L70 30 Z" fill="#d35400" opacity="0.25" stroke="${color}" stroke-width="3"/>
                <line x1="26" y1="30" x2="74" y2="30" stroke="${color}" stroke-width="3"/>
                <line x1="56" y1="16" x2="46" y2="75" stroke="#f1c40f" stroke-width="3.5" stroke-linecap="round"/>
                <circle cx="44" cy="72" r="3" fill="#2c3e50"/>
                <circle cx="54" cy="74" r="3" fill="#2c3e50"/>
                <circle cx="48" cy="65" r="3" fill="#2c3e50"/>
            </svg>`;
        default:
            return `<svg viewBox="0 0 100 100" class="food-svg-icon">
                <circle cx="50" cy="50" r="44" fill="#141721" stroke="${color}" stroke-width="2"/>
                <path d="M30 30 L70 70 M70 30 L30 70" stroke="${color}" stroke-width="4"/>
            </svg>`;
    }
}

// Cases Catalog
const CASES_DATA = [
    {
        id: 'street-food-case',
        name: 'Hôm Nay Ăn Gì?',
        tag: 'HÔM NAY ĂN GÌ?',
        subtitle: 'Bữa trưa bình dân đến tiệc tùng sang chảnh',
        banner: 'assets/images/case_banner.jpg',
        badge: 'PHỔ BIẾN NHẤT',
        description: 'Phân vân không biết hôm nay ăn gì? Bấm mở hòm để quay chọn ngay món ngon, từ Mì Tôm Hảo Hảo sinh viên đến Bò Wagyu A5 dát vàng 24K.',
        items: [
            // Mil-Spec (Blue - 79.92%)
            {
                id: 'item-mi-tom',
                name: 'Mì Tôm Hảo Hảo Trứng Cút',
                weapon: 'Mì Ăn Liền',
                category: 'Mì Ăn Liền',
                rarity: 'mil-spec',
                price: '15.000 đ',
                calories: '420 kcal',
                image: 'assets/images/mi_tom.jpg',
                lore: 'Món ăn sinh tồn cuối tháng kinh điển thơm nồng vị chua cay.'
            },
            {
                id: 'item-banh-mi',
                name: 'Bánh Mì Patê Trứng Ngải Cứu',
                weapon: 'Bánh Mì / Điểm Tâm',
                category: 'Bánh Mì / Điểm Tâm',
                rarity: 'mil-spec',
                price: '25.000 đ',
                calories: '510 kcal',
                image: 'assets/images/banh_mi.jpg',
                lore: 'Vỏ giòn rụm, patê béo ngậy, nạp đầy năng lượng cho buổi sáng.'
            },
            {
                id: 'item-com-rang',
                name: 'Cơm Rang Dưa Bò Lề Đường',
                weapon: 'Cơm Rang',
                category: 'Cơm Rang',
                rarity: 'mil-spec',
                price: '40.000 đ',
                calories: '680 kcal',
                image: 'assets/images/com_rang.jpg',
                lore: 'Chảo lửa bập bùng, dưa chua giòn sần sật, no căng bụng cho cả ngày.'
            },
            {
                id: 'item-vit-lon',
                name: 'Hột Vịt Lộn Rau Răm Gừng Tươi',
                weapon: 'Món Ăn Vặt',
                category: 'Món Ăn Vặt',
                rarity: 'mil-spec',
                price: '12.000 đ',
                calories: '180 kcal',
                image: 'assets/images/vit_lon.jpg',
                lore: 'Một quả hồi phục ngay năng lượng, chấm muối tiêu chanh cay nồng.'
            },
            {
                id: 'item-tra-sua',
                name: 'Trà Sữa Trân Châu Đường Đen',
                weapon: 'Giải Khát / Trà Sữa',
                category: 'Giải Khát / Trà Sữa',
                rarity: 'mil-spec',
                price: '35.000 đ',
                calories: '450 kcal',
                image: 'assets/images/tra_sua.jpg',
                lore: 'Trân châu dẻo dai, ngọt béo đập tan căng thẳng sau giờ làm việc mệt mỏi.'
            },

            // Restricted (Purple - 15.98%)
            {
                id: 'item-com-tam',
                name: 'Cơm Tấm Sườn Bì Chả Trứng Ốp',
                weapon: 'Cơm Tấm Đặc Sản',
                category: 'Cơm Tấm Đặc Sản',
                rarity: 'restricted',
                price: '65.000 đ',
                calories: '850 kcal',
                image: 'assets/images/com_tam.jpg',
                lore: 'Miếng sườn nướng than mỡ hành thơm nức mũi kích thích trọn vẹn vị giác.'
            },
            {
                id: 'item-pho-bo',
                name: 'Phở Bò Tái Lăn Nước Béo',
                weapon: 'Phở Truyền Thống',
                category: 'Phở Truyền Thống',
                rarity: 'restricted',
                price: '60.000 đ',
                calories: '650 kcal',
                image: 'assets/images/pho_bo.jpg',
                lore: 'Huyền thoại ẩm thực quốc dân, từng thìa nước dùng đậm đà hương vị thảo mộc.'
            },
            {
                id: 'item-bun-bo',
                name: 'Bún Bò Huế Chả Cua Giò Heo',
                weapon: 'Bún Bò Xứ Huế',
                category: 'Bún Bò Xứ Huế',
                rarity: 'restricted',
                price: '65.000 đ',
                calories: '720 kcal',
                image: 'assets/images/bun_bo.jpg',
                lore: 'Hương vị cay nồng của ớt sa tế kết hợp mắm ruốc và khoanh giò heo béo ngậy.'
            },
            {
                id: 'item-ga-ran',
                name: 'Gà Rán Giòn Cay Sốt Mật Ong',
                weapon: 'Gà Rán / Ăn Nhanh',
                category: 'Gà Rán / Ăn Nhanh',
                rarity: 'restricted',
                price: '75.000 đ',
                calories: '790 kcal',
                image: 'assets/images/ga_ran.jpg',
                lore: 'Lớp vỏ giòn tan phát ra âm thanh giòn rã trong từng miếng cắn.'
            },

            // Classified (Pink - 3.20%)
            {
                id: 'item-lau-bo',
                name: 'Lẩu Bò Ba Toa Khói Lửa Ngun Ngút',
                weapon: 'Lẩu Bò Nóng Hổi',
                category: 'Lẩu Bò Nóng Hổi',
                rarity: 'classified',
                price: '320.000 đ',
                calories: '1500 kcal',
                image: 'assets/images/lau_bo.jpg',
                lore: 'Nồi lẩu sôi sùng sục giữa đêm se lạnh, quây quần cả nhóm ăn uống no say.'
            },
            {
                id: 'item-sushi',
                name: 'Set Sashimi & Sushi Cá Hồi Tươi',
                weapon: 'Sushi & Sashimi Nhật',
                category: 'Sushi & Sashimi Nhật',
                rarity: 'classified',
                price: '280.000 đ',
                calories: '550 kcal',
                image: 'assets/images/sushi.jpg',
                lore: 'Vị tươi ngon thanh khiết tan ngay đầu lưỡi chuẩn phong vị xứ Phù Tang.'
            },
            {
                id: 'item-pizza',
                name: 'Pizza Gấp Đôi Phô Mai Viền Xúc Xích',
                weapon: 'Pizza Phô Mai Đút Lò',
                category: 'Pizza Phô Mai Đút Lò',
                rarity: 'classified',
                price: '240.000 đ',
                calories: '1200 kcal',
                image: 'assets/images/pizza_four_cheese.jpg',
                lore: 'Dòng phô mai kéo sợi dài béo ngậy, viền xúc xích nướng vàng giòn thơm lừng.'
            },

            // Covert (Red - 0.64%)
            {
                id: 'item-pizza-hut',
                name: 'Pizza Hut Thập Cẩm Siêu Phẩm Viền Phô Mai',
                weapon: 'Pizza Hut Thượng Hạng',
                category: 'Pizza Hut Thượng Hạng',
                rarity: 'covert',
                price: '249.000 đ',
                calories: '1150 kcal',
                image: 'assets/images/pizza_hut.jpg',
                lore: 'Huyền thoại Pizza Hut với đế bánh Pan giòn xốp trứ danh, viền phô mai kéo sợi thơm ngậy, ngập tràn xúc xích Pepperoni, bò băm nướng và sốt cà chua đậm vị Ý.'
            },
            {
                id: 'item-crab-cheese',
                name: 'Cua Hoàng Đế & Tôm Hùm Nướng Phô Mai',
                weapon: 'Hải Sản Cao Cấp',
                category: 'Hải Sản Cao Cấp',
                rarity: 'covert',
                price: '2.500.000 đ',
                calories: '1800 kcal',
                image: 'assets/images/covert_lobster.jpg',
                lore: 'Món ăn đắt đỏ của giới thượng lưu. Lớp phô mai cháy thơm lừng hòa quyện thớ thịt cua ngọt đậm.'
            },

            // Special Rare (Gold ★ - 0.26%)
            {
                id: 'item-gold-wagyu',
                name: '★ Bò Wagyu A5 Tomahawk Dát Vàng 24K ★',
                weapon: '★ Bò Wagyu Thượng Hạng ★',
                category: '★ Bò Wagyu Thượng Hạng ★',
                rarity: 'gold',
                price: '6.800.000 đ',
                calories: '2200 kcal',
                image: 'assets/images/gold_wagyu.jpg',
                lore: 'CỰC HIẾM! Thớ thịt vân mỡ cẩm thạch bọc vàng lá 24K lấp lánh ánh kim quang. Chỉ 0.26% may mắn có thể nếm thử kiệt tác này.'
            }
        ]
    },
    {
        id: 'office-lunch-case',
        name: 'Hòm Bữa Trưa Dân Văn Phòng',
        tag: 'OFFICE SURVIVAL CASE',
        subtitle: 'Trưa nay ăn gì để không phải đau đầu?',
        badge: 'CỨU CÁNH TRƯA NAY',
        description: 'Dành riêng cho những buổi trưa 11h45 cả công ty hỏi nhau: "Trưa nay ăn gì?". Cứ mở hòm là có câu trả lời!',
        items: [
            {
                id: 'ol-item-1',
                name: 'Cơm Văn Phòng Thịt Kho Trứng Cút',
                weapon: 'Cơm Trưa Văn Phòng',
                category: 'Cơm Trưa Văn Phòng',
                rarity: 'mil-spec',
                price: '35.000 đ',
                calories: '550 kcal',
                image: 'assets/images/com_van_phong.jpg',
                lore: 'Bữa trưa tiêu chuẩn quốc dân vừa túi tiền, đậm đà cơm mẹ nấu.'
            },
            {
                id: 'ol-item-2',
                name: 'Bún Chả Nem Nướng Hà Nội',
                weapon: 'Bún Chả Phố Cổ',
                category: 'Bún Chả Phố Cổ',
                rarity: 'restricted',
                price: '55.000 đ',
                calories: '650 kcal',
                image: 'assets/images/bun_cha.jpg',
                lore: 'Thịt nướng than hoa thơm lừng chấm nước mắm chua ngọt ấm bụng.'
            },
            {
                id: 'ol-item-3',
                name: 'Cơm Gà Xối Mỡ Da Giòn',
                weapon: 'Cơm Gà Xối Mỡ',
                category: 'Cơm Gà Xối Mỡ',
                rarity: 'restricted',
                price: '50.000 đ',
                calories: '750 kcal',
                image: 'assets/images/com_ga.jpg',
                lore: 'Đùi gà vàng ruộm, cơm chiên tỏi xì dầu thơm nức mũi.'
            },
            {
                id: 'ol-item-4',
                name: 'Cơm Niêu Bò Sốt Tiêu Đen Cháy Cạnh',
                weapon: 'Cơm Niêu Giòn Cháy',
                category: 'Cơm Niêu Giòn Cháy',
                rarity: 'classified',
                price: '110.000 đ',
                calories: '850 kcal',
                image: 'assets/images/com_nieu.jpg',
                lore: 'Tiếng xèo xèo của niêu cơm cháy giòn rụm sốt tiêu nóng hổi.'
            },
            {
                id: 'ol-pizza-hut',
                name: 'Pizza Hut Thập Cẩm Bữa Trưa Đồng Đội',
                weapon: 'Pizza Hut Tiệc Trưa',
                category: 'Pizza Hut Tiệc Trưa',
                rarity: 'covert',
                price: '249.000 đ',
                calories: '1150 kcal',
                image: 'assets/images/pizza_hut.jpg',
                lore: 'Bữa trưa thượng hạng cho cả team văn phòng! Đế Pan vàng ươm ngập tràn xúc xích nướng, thịt bò băm đậm đà và phô mai kéo sợi béo ngậy.'
            },
            {
                id: 'ol-item-5',
                name: 'Buffet Nướng Thượng Hạng (Sếp Bao Hết)',
                weapon: 'Tiệc Nướng BBQ',
                category: 'Tiệc Nướng BBQ',
                rarity: 'covert',
                price: '450.000 đ / người',
                calories: '2000 kcal',
                image: 'assets/images/covert_lobster.jpg',
                lore: 'Tin nhắn vang lên trong group chat: Hôm nay sếp mời cả team đi ăn thả ga!'
            },
            {
                id: 'ol-item-6',
                name: '★ Bữa Tối Michelin 3 Sao Thượng Hạng ★',
                weapon: '★ Fine Dining Michelin ★',
                category: '★ Fine Dining Michelin ★',
                rarity: 'gold',
                price: '8.000.000 đ',
                calories: '1600 kcal',
                image: 'assets/images/gold_wagyu.jpg',
                lore: 'Trúng bữa này thì rủ cả văn phòng đi thưởng thức tiệc ẩm thực đỉnh cao!'
            }
        ]
    },
    {
        id: 'pizza-party-case',
        name: 'Đại Tiệc Pizza Thượng Hạng',
        tag: 'PIZZA MANIA CASE',
        subtitle: 'Khám phá thế giới bánh Pizza đẫm phô mai kéo sợi thơm lừng',
        banner: 'assets/images/pizza_banner.jpg',
        badge: 'ĐẠI TIỆC PIZZA',
        description: 'Thiên đường dành cho tín đồ mê Pizza! Từ Margherita truyền thống Napoli, Pepperoni ngập phô mai cay nồng đến Bò Wagyu A5 dát vàng 24K & nấm Truffle trắng quý tộc.',
        items: [
            // Mil-Spec (Blue - 79.92%)
            {
                id: 'pz-margherita',
                name: 'Pizza Margherita Cổ Điển Napoli',
                weapon: 'Pizza Truyền Thống Ý',
                category: 'Pizza Truyền Thống Ý',
                rarity: 'mil-spec',
                price: '119.000 đ',
                calories: '850 kcal',
                image: 'assets/images/pizza_margherita.jpg',
                lore: 'Kiệt tác ẩm thực Napoli với sốt cà chua San Marzano đỏ mọng, phô mai Mozzarella tươi chảy tràn và lá húng quế thơm ngát.'
            },
            {
                id: 'pz-hawaii',
                name: 'Pizza Hawaii Dứa & Giăm Bông Nướng',
                weapon: 'Pizza Thập Cẩm',
                category: 'Pizza Thập Cẩm',
                rarity: 'mil-spec',
                price: '129.000 đ',
                calories: '920 kcal',
                image: 'assets/images/pizza_hawaii.jpg',
                lore: 'Sự hòa quyện hoàn hảo giữa vị ngọt thanh của dứa nướng lò than và vị mặn mà đậm đà của thịt giăm bông xông khói.'
            },
            {
                id: 'pz-veggie',
                name: 'Pizza Rau Củ Phô Mai (Garden Fresh)',
                weapon: 'Pizza Chay Thanh Đạm',
                category: 'Pizza Chay Thanh Đạm',
                rarity: 'mil-spec',
                price: '119.000 đ',
                calories: '780 kcal',
                image: 'assets/images/pizza_veggie.jpg',
                lore: 'Đầy ắp ớt chuông giòn ngọt, nấm mỡ tươi xào bơ, hành tây tím và quả ô liu đen ngập tràn phô mai thơm dịu thanh mát.'
            },
            {
                id: 'pz-sausage-corn',
                name: 'Pizza Xúc Xích Phô Mai Ngô Ngọt',
                weapon: 'Pizza Gia Đình',
                category: 'Pizza Gia Đình',
                rarity: 'mil-spec',
                price: '125.000 đ',
                calories: '890 kcal',
                image: 'assets/images/pizza_sausage_corn.jpg',
                lore: 'Từng lát xúc xích Đức nướng xém cạnh thơm nức kết hợp bắp ngọt vàng ươm giòn sần sật, món khoái khẩu của cả gia đình.'
            },

            // Restricted (Purple - 15.98%)
            {
                id: 'pz-pepperoni',
                name: 'Pizza Pepperoni Xúc Xích Cay Đẫm Phô Mai',
                weapon: 'Pizza Bán Chạy Nhất',
                category: 'Pizza Bán Chạy Nhất',
                rarity: 'restricted',
                price: '165.000 đ',
                calories: '1100 kcal',
                image: 'assets/images/pizza_pepperoni.jpg',
                lore: 'Món pizza quốc dân bán chạy nhất thế giới! Lát xúc xích Pepperoni viền giòn rụm bóng bẩy dầu ớt cay nồng đẫm sốt phô mai kéo sợi.'
            },
            {
                id: 'pz-bbq-chicken',
                name: 'Pizza Gà Nướng BBQ Khói & Nấm Mỡ',
                weapon: 'Pizza Thịt Gà Nướng',
                category: 'Pizza Thịt Gà Nướng',
                rarity: 'restricted',
                price: '175.000 đ',
                calories: '1050 kcal',
                image: 'assets/images/pizza_bbq_chicken.jpg',
                lore: 'Thịt ức gà nướng mềm mọng thấm đẫm sốt BBQ khói gỗ sồi, nấm mỡ tươi béo và hành tây nướng dậy mùi nồng nàn.'
            },
            {
                id: 'pz-meat-lovers',
                name: 'Pizza Meat Lovers Siêu Thịt 5 Loại',
                weapon: 'Pizza Ngập Tràn Thịt',
                category: 'Pizza Ngập Tràn Thịt',
                rarity: 'restricted',
                price: '185.000 đ',
                calories: '1350 kcal',
                image: 'assets/images/pizza_meat_lovers.jpg',
                lore: 'Đại tiệc thịt đích thực: Bò băm xào thơm, xúc xích Pepperoni cay, giăm bông thượng hạng, thịt heo muối xông khói ngập ngụa.'
            },
            {
                id: 'pz-four-cheese',
                name: 'Pizza 4 Loại Phô Mai Kèm Mật Ong Rừng',
                weapon: 'Pizza 4 Loại Phô Mai',
                category: 'Pizza 4 Loại Phô Mai',
                rarity: 'restricted',
                price: '195.000 đ',
                calories: '1250 kcal',
                image: 'assets/images/pizza_four_cheese.jpg',
                lore: 'Quattro Formaggi đỉnh cao kết hợp Mozzarella béo ngậy, Gorgonzola cay nồng, Parmesan đậm đà & Ricotta êm dịu, rưới mật ong thơm lừng.'
            },

            // Classified (Pink - 3.20%)
            {
                id: 'pz-seafood-pesto',
                name: 'Pizza Hải Sản Sốt Pesto Tôm Sú Mực Ống',
                weapon: 'Pizza Hải Sản Ý',
                category: 'Pizza Hải Sản Ý',
                rarity: 'classified',
                price: '265.000 đ',
                calories: '1150 kcal',
                image: 'assets/images/pizza_seafood_pesto.jpg',
                lore: 'Tôm sú tươi giòn sần sật, mực ống mềm ngọt tắm trong nước sốt húng tây Pesto xanh mướt ngát hương phô mai pecorino.'
            },
            {
                id: 'pz-truffle-burrata',
                name: 'Pizza Nấm Truffle Đen & Phô Mai Burrata Tươi',
                weapon: 'Pizza Thượng Hạng',
                category: 'Pizza Thượng Hạng',
                rarity: 'classified',
                price: '295.000 đ',
                calories: '1180 kcal',
                image: 'assets/images/pizza_truffle_burrata.jpg',
                lore: 'Trái phô mai Burrata tươi mềm múp cắt đôi vỡ òa kem béo ngậy, hòa cùng hương thơm nồng nàn quý tộc của nấm Truffle đen nước Ý.'
            },
            {
                id: 'pz-durian-cheese',
                name: 'Pizza Sầu Riêng Ri6 Nướng Phô Mai Cháy Cạnh',
                weapon: 'Pizza Trái Cây Độc Lạ',
                category: 'Pizza Trái Cây Độc Lạ',
                rarity: 'classified',
                price: '245.000 đ',
                calories: '1300 kcal',
                image: 'assets/images/pizza_durian_cheese.jpg',
                lore: 'Cơn sốt ẩm thực châu Á! Múi sầu riêng Ri6 vàng ươm ngọt lịm tan chảy cùng lớp phô mai đút lò cháy xém giòn tan siêu cuốn.'
            },

            // Covert (Red - 0.64%)
            {
                id: 'pz-pizza-hut',
                name: 'Pizza Hut Thập Cẩm Siêu Phẩm Viền Phô Mai',
                weapon: 'Pizza Hut Danh Tiếng',
                category: 'Pizza Hut Danh Tiếng',
                rarity: 'covert',
                price: '249.000 đ',
                calories: '1150 kcal',
                image: 'assets/images/pizza_hut.jpg',
                lore: 'Huyền thoại Pizza Hut với đế bánh Pan giòn xốp trứ danh, viền phô mai kéo sợi thơm ngậy, ngập tràn xúc xích Pepperoni, bò băm nướng và sốt cà chua đậm vị Ý.'
            },
            {
                id: 'pz-lobster-crab',
                name: 'Pizza Tôm Hùm Canada & Thịt Cua Tuyết',
                weapon: 'Pizza Cực Phẩm Hải Sản',
                category: 'Pizza Cực Phẩm Hải Sản',
                rarity: 'covert',
                price: '890.000 đ',
                calories: '1450 kcal',
                image: 'assets/images/pizza_lobster_crab.jpg',
                lore: 'Đuôi tôm hùm Canada nướng bơ tỏi thơm ngậy, ngập tràn thịt càng cua tuyết ngọt đậm và rắc trứng cá chuồn giòn nổ tách tách.'
            },
            {
                id: 'pz-angus-steak',
                name: 'Pizza Bít Tết Bò Black Angus Sốt Rượu Vang',
                weapon: 'Pizza Bò Bít Tết Cao Cấp',
                category: 'Pizza Bò Bít Tết Cao Cấp',
                rarity: 'covert',
                price: '750.000 đ',
                calories: '1380 kcal',
                image: 'assets/images/pizza_angus_steak.jpg',
                lore: 'Từng lát thăn bò Black Angus áp chảo chín tới mọng nước đỏ hồng, măng tây nướng và nước sốt nấm rượu vang đỏ sánh mịn đậm đà.'
            },

            // Special Rare (Gold ★ - 0.26%)
            {
                id: 'pz-gold-wagyu-truffle',
                name: '★ Pizza Bò Wagyu A5 Miyazaki Dát Vàng Lá 24K ★',
                weapon: '★ Siêu Phẩm Michelin ★',
                category: '★ Siêu Phẩm Michelin ★',
                rarity: 'gold',
                price: '4.500.000 đ',
                calories: '2100 kcal',
                image: 'assets/images/pizza_gold_wagyu.jpg',
                lore: 'ĐỈNH CAO HUYỀN THOẠI! Thăn bò Wagyu A5 Miyazaki với vân mỡ cẩm thạch tan chảy như bơ, nấm Truffle trắng Alba rắc phủ kín vàng lá 24K ánh kim quyền quý.'
            }
        ]
    }
];

window.CASES_DATA = CASES_DATA;
window.RARITY_TYPES = RARITY_TYPES;
window.WEAR_CONDITIONS = WEAR_CONDITIONS;
window.getFoodSvg = getFoodSvg;
