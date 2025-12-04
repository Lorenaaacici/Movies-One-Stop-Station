// Book Page - Booking Manager
// Handles the complete booking flow with real location/cinema data

const TMDB_API_KEY = 'a07e22bc18f5cb106bfe4cc1f83ad8ed';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Default poster SVG for missing images
const DEFAULT_POSTER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='450' viewBox='0 0 300 450'%3E%3Crect fill='%231a1a1a' width='300' height='450'/%3E%3Crect fill='%232a2a2a' x='20' y='20' width='260' height='410' rx='8'/%3E%3Ctext x='150' y='200' text-anchor='middle' fill='%23666' font-family='Arial' font-size='48'%3E%F0%9F%8E%AC%3C/text%3E%3Ctext x='150' y='250' text-anchor='middle' fill='%23555' font-family='Arial' font-size='14'%3ENo Poster%3C/text%3E%3Ctext x='150' y='275' text-anchor='middle' fill='%23444' font-family='Arial' font-size='12'%3EAvailable%3C/text%3E%3C/svg%3E";

// Cinema Data - Real Australian Cinemas
const CinemaData = {
    nsw: {
        name: 'New South Wales',
        cities: {
            sydney: {
                name: 'Sydney',
                cinemas: [
                    { id: 'event-george', name: 'Event Cinemas George Street', address: '505-525 George St, Sydney NSW 2000', distance: '0.2 km' },
                    { id: 'hoyts-broadway', name: 'Hoyts Broadway', address: 'Bay 1, Broadway Shopping Centre, Sydney NSW 2007', distance: '2.1 km' },
                    { id: 'palace-verona', name: 'Palace Verona', address: '17 Oxford St, Paddington NSW 2021', distance: '3.5 km' },
                    { id: 'dendy-opera', name: 'Dendy Opera Quays', address: 'Shop 9/2 East Circular Quay, Sydney NSW 2000', distance: '0.8 km' },
                    { id: 'imax-darling', name: 'IMAX Sydney', address: '31 Wheat Rd, Darling Harbour NSW 2000', distance: '1.2 km' },
                    { id: 'event-bondi', name: 'Event Cinemas Bondi Junction', address: '500 Oxford St, Bondi Junction NSW 2022', distance: '6.5 km' },
                    { id: 'hoyts-entertainment', name: 'Hoyts Entertainment Quarter', address: '122 Lang Rd, Moore Park NSW 2021', distance: '4.2 km' }
                ]
            },
            parramatta: {
                name: 'Parramatta',
                cinemas: [
                    { id: 'event-parramatta', name: 'Event Cinemas Parramatta', address: 'Westfield Parramatta, 159-175 Church St, Parramatta NSW 2150', distance: '0.3 km' },
                    { id: 'hoyts-parramatta', name: 'Hoyts Parramatta', address: 'Level 7, Westfield Parramatta, Parramatta NSW 2150', distance: '0.3 km' }
                ]
            },
            newcastle: {
                name: 'Newcastle',
                cinemas: [
                    { id: 'event-charlestown', name: 'Event Cinemas Charlestown', address: 'Charlestown Square, 30 Pearson St, Charlestown NSW 2290', distance: '0.4 km' },
                    { id: 'hoyts-kotara', name: 'Hoyts Kotara', address: 'Westfield Kotara, Cnr Park Ave & Northcott Dr, Kotara NSW 2289', distance: '3.2 km' },
                    { id: 'reading-newcastle', name: 'Reading Cinemas Newcastle', address: '183 Hunter St, Newcastle NSW 2300', distance: '5.1 km' }
                ]
            },
            wollongong: {
                name: 'Wollongong',
                cinemas: [
                    { id: 'event-wollongong', name: 'Event Cinemas Wollongong', address: 'Wollongong Central, 200 Crown St, Wollongong NSW 2500', distance: '0.2 km' },
                    { id: 'hoyts-warrawong', name: 'Hoyts Warrawong', address: 'Westfield Warrawong, King St, Warrawong NSW 2502', distance: '4.8 km' }
                ]
            },
            penrith: {
                name: 'Penrith',
                cinemas: [
                    { id: 'hoyts-penrith', name: 'Hoyts Penrith', address: 'Westfield Penrith, 585 High St, Penrith NSW 2750', distance: '0.3 km' },
                    { id: 'event-penrith', name: 'Event Cinemas Penrith', address: 'Panthers World of Entertainment, 123 Mulgoa Rd, Penrith NSW 2750', distance: '2.1 km' }
                ]
            },
            liverpool: {
                name: 'Liverpool',
                cinemas: [
                    { id: 'event-liverpool', name: 'Event Cinemas Liverpool', address: 'Westfield Liverpool, Macquarie St, Liverpool NSW 2170', distance: '0.2 km' }
                ]
            },
            chatswood: {
                name: 'Chatswood',
                cinemas: [
                    { id: 'hoyts-chatswood', name: 'Hoyts Chatswood', address: 'Westfield Chatswood, 1 Anderson St, Chatswood NSW 2067', distance: '0.3 km' },
                    { id: 'event-macquarie', name: 'Event Cinemas Macquarie', address: 'Macquarie Centre, Herring Rd, North Ryde NSW 2113', distance: '4.5 km' }
                ]
            }
        }
    },
    victoria: {
        name: 'Victoria',
        cities: {
            melbourne: {
                name: 'Melbourne',
                cinemas: [
                    { id: 'hoyts-melbourne', name: 'Hoyts Melbourne Central', address: 'Level 3, Melbourne Central, 300 Lonsdale St, Melbourne VIC 3000', distance: '0.2 km' },
                    { id: 'village-crown', name: 'Village Cinemas Crown', address: 'Level 3, Crown Entertainment Complex, 8 Whiteman St, Southbank VIC 3006', distance: '1.5 km' },
                    { id: 'palace-como', name: 'Palace Cinema Como', address: 'Cnr Toorak Rd & Chapel St, South Yarra VIC 3141', distance: '4.2 km' },
                    { id: 'imax-melbourne', name: 'IMAX Melbourne', address: 'Melbourne Museum, 11 Nicholson St, Carlton VIC 3053', distance: '1.8 km' },
                    { id: 'cinema-nova', name: 'Cinema Nova', address: '380 Lygon St, Carlton VIC 3053', distance: '2.1 km' },
                    { id: 'sun-theatre', name: 'Sun Theatre', address: '8 Ballarat St, Yarraville VIC 3013', distance: '7.5 km' },
                    { id: 'astor-theatre', name: 'Astor Theatre', address: '1 Chapel St, St Kilda VIC 3182', distance: '6.8 km' }
                ]
            },
            geelong: {
                name: 'Geelong',
                cinemas: [
                    { id: 'village-geelong', name: 'Village Cinemas Geelong', address: 'Westfield Geelong, 95 Malop St, Geelong VIC 3220', distance: '0.3 km' },
                    { id: 'pivotonian', name: 'Pivotonian Cinema', address: '12 Malop St, Geelong VIC 3220', distance: '0.5 km' },
                    { id: 'reading-waurn', name: 'Reading Cinemas Waurn Ponds', address: 'Waurn Ponds Shopping Centre, Princes Hwy, Waurn Ponds VIC 3216', distance: '8.2 km' }
                ]
            },
            ballarat: {
                name: 'Ballarat',
                cinemas: [
                    { id: 'reading-ballarat', name: 'Reading Cinemas Ballarat', address: '1117-1123 Sturt St, Ballarat VIC 3350', distance: '0.4 km' },
                    { id: 'regent-ballarat', name: 'Regent Cinemas Ballarat', address: '49 Lydiard St N, Ballarat VIC 3350', distance: '0.6 km' }
                ]
            },
            bendigo: {
                name: 'Bendigo',
                cinemas: [
                    { id: 'reading-bendigo', name: 'Reading Cinemas Bendigo', address: 'Bendigo Marketplace, 116 Mitchell St, Bendigo VIC 3550', distance: '0.2 km' },
                    { id: 'star-cinema', name: 'The Star Cinema', address: '30 Eaglehawk Rd, Eaglehawk VIC 3556', distance: '4.5 km' }
                ]
            },
            frankston: {
                name: 'Frankston',
                cinemas: [
                    { id: 'hoyts-frankston', name: 'Hoyts Frankston', address: 'Bayside Shopping Centre, 28 Beach St, Frankston VIC 3199', distance: '0.3 km' }
                ]
            },
            doncaster: {
                name: 'Doncaster',
                cinemas: [
                    { id: 'hoyts-doncaster', name: 'Hoyts Doncaster', address: 'Westfield Doncaster, 619 Doncaster Rd, Doncaster VIC 3108', distance: '0.2 km' },
                    { id: 'village-box-hill', name: 'Village Cinemas Box Hill', address: 'Box Hill Central, 1 Main St, Box Hill VIC 3128', distance: '3.8 km' }
                ]
            }
        }
    },
    queensland: {
        name: 'Queensland',
        cities: {
            brisbane: {
                name: 'Brisbane',
                cinemas: [
                    { id: 'event-myer', name: 'Event Cinemas Myer Centre', address: 'Level 3, Myer Centre, 91 Queen St, Brisbane QLD 4000', distance: '0.2 km' },
                    { id: 'hoyts-stafford', name: 'Hoyts Stafford', address: '400 Stafford Rd, Stafford QLD 4053', distance: '6.5 km' },
                    { id: 'palace-barracks', name: 'Palace Barracks', address: '61 Petrie Terrace, Petrie Terrace QLD 4000', distance: '1.2 km' },
                    { id: 'event-southbank', name: 'Event Cinemas South Bank', address: 'South Bank Lifestyle Precinct, Grey St, South Brisbane QLD 4101', distance: '1.5 km' },
                    { id: 'birch-carroll', name: 'Birch Carroll & Coyle Indooroopilly', address: 'Indooroopilly Shopping Centre, 322 Moggill Rd, Indooroopilly QLD 4068', distance: '7.2 km' },
                    { id: 'dendy-portside', name: 'Dendy Portside', address: '39 Hercules St, Hamilton QLD 4007', distance: '4.8 km' },
                    { id: 'new-farm', name: 'New Farm Cinemas', address: '701 Brunswick St, New Farm QLD 4005', distance: '2.5 km' }
                ]
            },
            goldcoast: {
                name: 'Gold Coast',
                cinemas: [
                    { id: 'event-pacific', name: 'Event Cinemas Pacific Fair', address: 'Pacific Fair Shopping Centre, Hooker Blvd, Broadbeach QLD 4218', distance: '0.5 km' },
                    { id: 'village-robina', name: 'Village Cinemas Robina', address: 'Robina Town Centre, Robina Town Centre Dr, Robina QLD 4226', distance: '8.5 km' },
                    { id: 'hoyts-southport', name: 'Hoyts Southport', address: 'Australia Fair Shopping Centre, Marine Parade, Southport QLD 4215', distance: '3.2 km' },
                    { id: 'birch-surfers', name: 'Birch Carroll & Coyle Surfers Paradise', address: 'Paradise Centre, 3128 Surfers Paradise Blvd, Surfers Paradise QLD 4217', distance: '2.1 km' }
                ]
            },
            townsville: {
                name: 'Townsville',
                cinemas: [
                    { id: 'birch-townsville', name: 'Birch Carroll & Coyle Townsville', address: 'Willows Shopping Centre, 1 Hervey Range Rd, Thuringowa Central QLD 4817', distance: '0.3 km' },
                    { id: 'event-townsville', name: 'Event Cinemas Townsville', address: 'Castletown Shopping Centre, Hyde Park, Townsville QLD 4810', distance: '2.8 km' }
                ]
            },
            cairns: {
                name: 'Cairns',
                cinemas: [
                    { id: 'birch-cairns', name: 'Birch Carroll & Coyle Cairns', address: 'Cairns Central Shopping Centre, 1-21 McLeod St, Cairns QLD 4870', distance: '0.3 km' },
                    { id: 'event-smithfield', name: 'Event Cinemas Smithfield', address: 'Smithfield Shopping Centre, Captain Cook Hwy, Smithfield QLD 4878', distance: '12 km' }
                ]
            },
            sunshine: {
                name: 'Sunshine Coast',
                cinemas: [
                    { id: 'birch-maroochydore', name: 'Birch Carroll & Coyle Maroochydore', address: 'Sunshine Plaza, 154-164 Horton Parade, Maroochydore QLD 4558', distance: '0.4 km' },
                    { id: 'reading-noosa', name: 'Reading Cinemas Noosa', address: 'Noosa Civic Shopping Centre, 28 Eenie Creek Rd, Noosaville QLD 4566', distance: '15 km' }
                ]
            },
            toowoomba: {
                name: 'Toowoomba',
                cinemas: [
                    { id: 'reading-toowoomba', name: 'Reading Cinemas Toowoomba', address: 'Grand Central Shopping Centre, Cnr Margaret St & Dent St, Toowoomba QLD 4350', distance: '0.3 km' },
                    { id: 'birch-toowoomba', name: 'Birch Carroll & Coyle Toowoomba', address: '440 Ruthven St, Toowoomba QLD 4350', distance: '1.2 km' }
                ]
            }
        }
    },
    wa: {
        name: 'Western Australia',
        cities: {
            perth: {
                name: 'Perth',
                cinemas: [
                    { id: 'hoyts-carousel', name: 'Hoyts Carousel', address: 'Westfield Carousel, 1382 Albany Hwy, Cannington WA 6107', distance: '0.3 km' },
                    { id: 'event-innaloo', name: 'Event Cinemas Innaloo', address: 'Innaloo Shopping Centre, Liege St, Innaloo WA 6018', distance: '8.5 km' },
                    { id: 'palace-raine', name: 'Palace Raine Square', address: '300 Murray St, Perth WA 6000', distance: '0.5 km' },
                    { id: 'luna-palace', name: 'Luna Palace Cinemas', address: '155 Oxford St, Leederville WA 6007', distance: '3.2 km' },
                    { id: 'reading-belmont', name: 'Reading Cinemas Belmont', address: 'Belmont Forum, 227 Belmont Ave, Cloverdale WA 6105', distance: '6.8 km' },
                    { id: 'hoyts-woden', name: 'Hoyts Garden City', address: 'Garden City Shopping Centre, 125 Riseley St, Booragoon WA 6154', distance: '9.5 km' }
                ]
            },
            fremantle: {
                name: 'Fremantle',
                cinemas: [
                    { id: 'luna-fremantle', name: 'Luna on SX', address: '13 Essex St, Fremantle WA 6160', distance: '0.3 km' },
                    { id: 'hoyts-millennium', name: 'Hoyts Millennium', address: 'Cockburn Gateway Shopping City, 816 Beeliar Dr, Success WA 6164', distance: '8.5 km' }
                ]
            },
            mandurah: {
                name: 'Mandurah',
                cinemas: [
                    { id: 'reading-mandurah', name: 'Reading Cinemas Mandurah', address: 'Mandurah Forum, 330 Pinjarra Rd, Mandurah WA 6210', distance: '0.4 km' }
                ]
            },
            joondalup: {
                name: 'Joondalup',
                cinemas: [
                    { id: 'grand-joondalup', name: 'Grand Cinemas Joondalup', address: 'Lakeside Joondalup Shopping City, 420 Joondalup Dr, Joondalup WA 6027', distance: '0.3 km' },
                    { id: 'event-whitfords', name: 'Event Cinemas Whitford City', address: 'Whitford City Shopping Centre, Whitfords Ave, Hillarys WA 6025', distance: '5.2 km' }
                ]
            }
        }
    },
    sa: {
        name: 'South Australia',
        cities: {
            adelaide: {
                name: 'Adelaide',
                cinemas: [
                    { id: 'hoyts-norwood', name: 'Hoyts Norwood', address: 'Norwood Place, 179 The Parade, Norwood SA 5067', distance: '3.5 km' },
                    { id: 'palace-nova-east', name: 'Palace Nova Eastend', address: '251 Rundle St, Adelaide SA 5000', distance: '0.3 km' },
                    { id: 'palace-nova-prospect', name: 'Palace Nova Prospect', address: '98 Prospect Rd, Prospect SA 5082', distance: '4.2 km' },
                    { id: 'event-marion', name: 'Event Cinemas Marion', address: 'Westfield Marion, 297 Diagonal Rd, Oaklands Park SA 5046', distance: '8.5 km' },
                    { id: 'reading-west-lakes', name: 'Reading Cinemas West Lakes', address: 'West Lakes Shopping Centre, 111 West Lakes Blvd, West Lakes SA 5021', distance: '9.8 km' },
                    { id: 'glenelg-cinema', name: 'Glenelg Cinema', address: '21 Partridge St, Glenelg SA 5045', distance: '10.5 km' },
                    { id: 'wallis-mitcham', name: 'Wallis Mitcham', address: '119 Belair Rd, Torrens Park SA 5062', distance: '6.8 km' }
                ]
            },
            mountgambier: {
                name: 'Mount Gambier',
                cinemas: [
                    { id: 'oatmill-cinema', name: 'Oatmill Cinema', address: '1 Krummel St, Mount Gambier SA 5290', distance: '0.5 km' }
                ]
            },
            portaugusta: {
                name: 'Port Augusta',
                cinemas: [
                    { id: 'capri-portaugusta', name: 'Capri Theatre Port Augusta', address: '45 Commercial Rd, Port Augusta SA 5700', distance: '0.3 km' }
                ]
            }
        }
    },
    tasmania: {
        name: 'Tasmania',
        cities: {
            hobart: {
                name: 'Hobart',
                cinemas: [
                    { id: 'village-hobart', name: 'Village Cinemas Eastlands', address: 'Eastlands Shopping Centre, 26 Bligh St, Rosny Park TAS 7018', distance: '4.5 km' },
                    { id: 'state-cinema', name: 'State Cinema', address: '375 Elizabeth St, North Hobart TAS 7000', distance: '1.2 km' },
                    { id: 'village-glenorchy', name: 'Village Cinemas Glenorchy', address: 'Northgate Shopping Centre, Main Rd, Glenorchy TAS 7010', distance: '6.8 km' }
                ]
            },
            launceston: {
                name: 'Launceston',
                cinemas: [
                    { id: 'village-launceston', name: 'Village Cinemas Launceston', address: 'Brisbane Street Mall, 163 Brisbane St, Launceston TAS 7250', distance: '0.3 km' },
                    { id: 'paramount-twin', name: 'Paramount Twin Cinema', address: '96 Wellington St, Launceston TAS 7250', distance: '0.5 km' }
                ]
            },
            devonport: {
                name: 'Devonport',
                cinemas: [
                    { id: 'cinema-devonport', name: 'Devonport Cinema', address: '5-7 Best St, Devonport TAS 7310', distance: '0.3 km' }
                ]
            },
            burnie: {
                name: 'Burnie',
                cinemas: [
                    { id: 'metro-burnie', name: 'Metro Cinemas Burnie', address: '46 Wilson St, Burnie TAS 7320', distance: '0.4 km' }
                ]
            }
        }
    },
    act: {
        name: 'Australian Capital Territory',
        cities: {
            canberra: {
                name: 'Canberra',
                cinemas: [
                    { id: 'hoyts-belconnen', name: 'Hoyts Belconnen', address: 'Westfield Belconnen, Benjamin Way, Belconnen ACT 2617', distance: '0.3 km' },
                    { id: 'hoyts-woden', name: 'Hoyts Woden', address: 'Westfield Woden, Keltie St, Phillip ACT 2606', distance: '6.5 km' },
                    { id: 'dendy-canberra', name: 'Dendy Canberra Centre', address: 'Canberra Centre, 148 Bunda St, Canberra ACT 2601', distance: '0.2 km' },
                    { id: 'palace-electric', name: 'Palace Electric Cinema', address: '2 Phillip Law St, NewActon ACT 2601', distance: '0.8 km' },
                    { id: 'limelight-tuggeranong', name: 'Limelight Cinemas Tuggeranong', address: 'Hyperdome Shopping Centre, Anketell St, Tuggeranong ACT 2900', distance: '12 km' },
                    { id: 'capitol-manuka', name: 'Capitol Cinema Manuka', address: '49 Franklin St, Manuka ACT 2603', distance: '3.2 km' }
                ]
            }
        }
    },
    nt: {
        name: 'Northern Territory',
        cities: {
            darwin: {
                name: 'Darwin',
                cinemas: [
                    { id: 'birch-casuarina', name: 'Birch Carroll & Coyle Casuarina', address: 'Casuarina Square, 247 Trower Rd, Casuarina NT 0810', distance: '0.3 km' },
                    { id: 'deckchair', name: 'Deckchair Cinema', address: 'Jervois Rd, The Esplanade, Darwin NT 0800', distance: '2.5 km' },
                    { id: 'event-darwin', name: 'Event Cinemas Darwin', address: 'Mitchell Centre, 55-59 Mitchell St, Darwin NT 0800', distance: '0.5 km' }
                ]
            },
            alicesprings: {
                name: 'Alice Springs',
                cinemas: [
                    { id: 'alice-cinema', name: 'Alice Springs Cinema', address: 'Todd Mall, Alice Springs NT 0870', distance: '0.2 km' },
                    { id: 'araluen-arts', name: 'Araluen Arts Centre', address: '61 Larapinta Dr, Araluen NT 0870', distance: '3.5 km' }
                ]
            },
            katherine: {
                name: 'Katherine',
                cinemas: [
                    { id: 'katherine-cinema', name: 'Katherine Cinema', address: 'Katherine Terrace, Katherine NT 0850', distance: '0.3 km' }
                ]
            }
        }
    }
};

// Ticket pricing (realistic Australian cinema prices)
const TicketPrices = {
    adult: 24.00,
    concession: 19.00,
    child: 17.00,
    family: 72.00  // 2 Adults + 2 Children
};

// Session type features available at different cinemas
const SessionFeatures = {
    'cc': { name: 'Closed Captions', icon: 'CC' },
    'ad': { name: 'Audio Description', icon: 'AD' },
    '3d': { name: '3D', icon: '3D', priceAdd: 4.00 },
    'imax': { name: 'IMAX', icon: 'IMAX', priceAdd: 6.00 },
    'dolby': { name: 'Dolby Atmos', icon: 'DOLBY', priceAdd: 3.00 }
};

// Booking Manager - Handles the booking flow
const BookingManager = {
    state: {
        selectedState: null,
        selectedCity: null,
        selectedCinema: null,
        selectedDate: null,
        selectedMovie: null,
        selectedShowtime: null,
        selectedSessionType: null,
        tickets: {
            adult: 0,
            concession: 0,
            child: 0,
            family: 0
        },
        activeFilters: []
    },

    // Initialize the booking page
    init() {
        this.initCustomSelects();
        this.initFilters();
        this.initCinemaSearch();
        this.checkUrlParams();
        this.renderDates();
        console.log('📽️ BookingManager initialized');
    },

    // Initialize cinema search
    initCinemaSearch() {
        const cinemaSearch = document.getElementById('cinema-search');
        if (cinemaSearch) {
            cinemaSearch.addEventListener('input', (e) => {
                this.filterCinemas(e.target.value);
            });
        }
    },

    // Initialize custom select dropdowns
    initCustomSelects() {
        // State select
        const stateWrapper = document.getElementById('state-select-wrapper');
        const stateSelected = document.getElementById('state-selected');
        const stateOptions = document.getElementById('state-options');

        if (stateSelected) {
            stateSelected.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSelect('state-select-wrapper');
            });
        }

        if (stateOptions) {
            stateOptions.querySelectorAll('.select-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const value = option.dataset.value;
                    const text = option.textContent;
                    this.selectStateOption(value, text);
                });
            });
        }

        // City select
        const citySelected = document.getElementById('city-selected');
        if (citySelected) {
            citySelected.addEventListener('click', (e) => {
                e.stopPropagation();
                const cityWrapper = document.getElementById('city-select-wrapper');
                if (!cityWrapper.classList.contains('disabled')) {
                    this.toggleSelect('city-select-wrapper');
                }
            });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            this.closeAllSelects();
        });
    },

    toggleSelect(wrapperId) {
        const wrapper = document.getElementById(wrapperId);
        const wasOpen = wrapper.classList.contains('open');

        this.closeAllSelects();

        if (!wasOpen) {
            wrapper.classList.add('open');
        }
    },

    closeAllSelects() {
        document.querySelectorAll('.custom-select.open').forEach(el => {
            el.classList.remove('open');
        });
    },

    selectStateOption(value, text) {
        const stateSelected = document.getElementById('state-selected');
        const stateOptions = document.getElementById('state-options');

        // Update display
        stateSelected.querySelector('span').textContent = text;

        // Update selected class
        stateOptions.querySelectorAll('.select-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.value === value);
        });

        this.closeAllSelects();
        this.selectState(value);
    },

    // Initialize filter chips with real filtering
    initFilters() {
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                chip.classList.toggle('active');
                const filter = chip.dataset.filter;

                if (chip.classList.contains('active')) {
                    this.state.activeFilters.push(filter);
                } else {
                    this.state.activeFilters = this.state.activeFilters.filter(f => f !== filter);
                }

                // Update price display if premium format is selected
                this.updatePrice();

                // If movies are loaded, filter/regenerate showtimes
                if (this.state.selectedCinema) {
                    this.loadMoviesForCinema();
                }

                console.log('Active filters:', this.state.activeFilters);
            });
        });
    },

    // Check URL parameters for pre-selected movie
    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');
        const movieTitle = urlParams.get('title');

        if (movieId) {
            this.fetchMovieDetails(movieId);
            document.getElementById('empty-state').style.display = 'none';
        }
    },

    // Fetch movie details from TMDB and show banner
    async fetchMovieDetails(movieId) {
        try {
            const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`);
            const movie = await response.json();

            const poster = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : DEFAULT_POSTER;
            const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
            const genres = movie.genres ? movie.genres.slice(0, 2).map(g => g.name).join(', ') : '';

            this.state.selectedMovie = {
                id: movie.id,
                title: movie.title,
                poster: poster,
                year: year,
                genres: genres,
                runtime: movie.runtime
            };

            // Show banner
            const banner = document.getElementById('selected-movie-banner');
            document.getElementById('banner-poster').src = poster;
            document.getElementById('banner-title').textContent = movie.title;
            document.getElementById('banner-meta').textContent = `${year}${genres ? ' • ' + genres : ''}`;
            banner.style.display = 'block';

            console.log('📽️ Movie pre-selected:', movie.title);
        } catch (error) {
            console.error('Failed to fetch movie:', error);
        }
    },

    // Clear selected movie
    clearSelectedMovie() {
        this.state.selectedMovie = null;
        document.getElementById('selected-movie-banner').style.display = 'none';

        // Update URL
        const url = new URL(window.location);
        url.searchParams.delete('id');
        url.searchParams.delete('title');
        window.history.replaceState({}, '', url);
    },

    // State selection handler
    selectState(stateKey) {
        const cityWrapper = document.getElementById('city-select-wrapper');
        const citySelected = document.getElementById('city-selected');
        const cityOptions = document.getElementById('city-options');
        const cinemaList = document.getElementById('cinema-list');

        if (!stateKey) {
            cityWrapper.classList.add('disabled');
            citySelected.querySelector('span').textContent = 'Choose a city...';
            cityOptions.innerHTML = '<div class="select-option" data-value="">Choose a city...</div>';
            cinemaList.style.display = 'none';
            this.state.selectedState = null;
            this.state.selectedCity = null;
            return;
        }

        this.state.selectedState = stateKey;
        this.state.selectedCity = null;
        this.state.selectedCinema = null;

        const stateData = CinemaData[stateKey];
        if (stateData) {
            let optionsHtml = '<div class="select-option" data-value="">Choose a city...</div>';
            Object.entries(stateData.cities).forEach(([key, city]) => {
                optionsHtml += `<div class="select-option" data-value="${key}">${city.name}</div>`;
            });

            cityOptions.innerHTML = optionsHtml;
            citySelected.querySelector('span').textContent = 'Choose a city...';
            cityWrapper.classList.remove('disabled');

            // Add click handlers to new city options
            cityOptions.querySelectorAll('.select-option').forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const value = option.dataset.value;
                    const text = option.textContent;
                    this.selectCityOption(value, text);
                });
            });
        }

        cinemaList.style.display = 'none';
        this.hideEmptyState();
    },

    selectCityOption(value, text) {
        const citySelected = document.getElementById('city-selected');
        const cityOptions = document.getElementById('city-options');

        citySelected.querySelector('span').textContent = text;

        cityOptions.querySelectorAll('.select-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.value === value);
        });

        this.closeAllSelects();
        this.selectCity(value);
    },

    // City selection handler
    selectCity(cityKey) {
        const cinemaList = document.getElementById('cinema-list');
        const cinemaCards = document.getElementById('cinema-cards');
        const cinemaSearch = document.getElementById('cinema-search');

        if (!cityKey || !this.state.selectedState) {
            cinemaList.style.display = 'none';
            this.state.selectedCity = null;
            return;
        }

        this.state.selectedCity = cityKey;
        this.state.selectedCinema = null;

        const cityData = CinemaData[this.state.selectedState]?.cities[cityKey];
        if (cityData && cityData.cinemas.length > 0) {
            // Store cinemas for filtering
            this.currentCinemas = cityData.cinemas;
            this.renderCinemaCards(cityData.cinemas);
            cinemaList.style.display = 'block';

            // Clear search input
            if (cinemaSearch) {
                cinemaSearch.value = '';
            }
        }
    },

    // Render cinema cards
    renderCinemaCards(cinemas) {
        const cinemaCards = document.getElementById('cinema-cards');
        const locationIcon = `<svg class="distance-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

        if (cinemas.length === 0) {
            cinemaCards.innerHTML = '<p class="no-cinemas">No cinemas found matching your search.</p>';
            return;
        }

        cinemaCards.innerHTML = cinemas.map(cinema => `
            <div class="cinema-card" onclick="BookingManager.selectCinema('${cinema.id}')" data-cinema-id="${cinema.id}">
                <h4>${cinema.name}</h4>
                <p>${cinema.address}</p>
                <span class="cinema-distance">${locationIcon}${cinema.distance}</span>
            </div>
        `).join('');
    },

    // Filter cinemas by search query
    filterCinemas(query) {
        if (!this.currentCinemas) return;

        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) {
            this.renderCinemaCards(this.currentCinemas);
            return;
        }

        const filtered = this.currentCinemas.filter(cinema =>
            cinema.name.toLowerCase().includes(searchTerm) ||
            cinema.address.toLowerCase().includes(searchTerm)
        );
        this.renderCinemaCards(filtered);
    },

    // Cinema selection handler
    selectCinema(cinemaId) {
        // Update selected state
        document.querySelectorAll('.cinema-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.cinemaId === cinemaId);
        });

        // Find cinema data
        const cityData = CinemaData[this.state.selectedState]?.cities[this.state.selectedCity];
        const cinema = cityData?.cinemas.find(c => c.id === cinemaId);

        if (cinema) {
            this.state.selectedCinema = cinema;
            document.getElementById('selected-cinema-name').textContent = cinema.name;

            // Show movie step
            document.getElementById('step-movie').style.display = 'block';
            this.loadMoviesForCinema();

            // Scroll to movie step
            setTimeout(() => {
                document.getElementById('step-movie').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    },

    // Render date selector
    renderDates() {
        const dateSelector = document.getElementById('date-selector');
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();

        let html = '';
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            const dayName = i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : days[date.getDay()]);
            const dayNum = date.getDate();
            const dateStr = date.toISOString().split('T')[0];

            html += `
                <button class="date-btn ${i === 0 ? 'selected' : ''}" onclick="BookingManager.selectDate('${dateStr}')" data-date="${dateStr}">
                    <span class="day-name">${dayName}</span>
                    <span class="day-num">${dayNum}</span>
                </button>
            `;
        }
        dateSelector.innerHTML = html;
        this.state.selectedDate = today.toISOString().split('T')[0];
    },

    // Date selection handler
    selectDate(dateStr) {
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.date === dateStr);
        });
        this.state.selectedDate = dateStr;
        this.loadMoviesForCinema();
    },

    // Load movies showing at cinema
    async loadMoviesForCinema() {
        const moviesGrid = document.getElementById('movies-grid');
        moviesGrid.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Loading movies...</p>';

        try {
            // If we have a pre-selected movie, show it first
            let movies = [];

            if (this.state.selectedMovie) {
                // Add pre-selected movie to the list
                const response = await fetch(`${TMDB_BASE_URL}/movie/${this.state.selectedMovie.id}?api_key=${TMDB_API_KEY}`);
                const preselected = await response.json();
                movies.push(preselected);
            }

            // Fetch now playing movies from TMDB
            const response = await fetch(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&region=AU`);
            const data = await response.json();

            // Add other movies (excluding pre-selected if exists)
            const otherMovies = data.results
                .filter(m => !this.state.selectedMovie || m.id !== this.state.selectedMovie.id)
                .slice(0, this.state.selectedMovie ? 5 : 6);

            movies = [...movies, ...otherMovies];

            if (movies.length === 0) {
                moviesGrid.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No movies available at this cinema.</p>';
                return;
            }

            // Generate showtimes for each movie
            const showtimes = ['10:30 AM', '1:15 PM', '4:00 PM', '6:45 PM', '9:30 PM'];

            moviesGrid.innerHTML = movies.map((movie, index) => {
                const poster = movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : DEFAULT_POSTER;
                const movieShowtimes = this.generateShowtimesWithFeatures(showtimes);
                const isPreselected = index === 0 && this.state.selectedMovie && movie.id === this.state.selectedMovie.id;

                // Filter showtimes based on active filters
                const filteredShowtimes = this.filterShowtimes(movieShowtimes);

                if (filteredShowtimes.length === 0 && this.state.activeFilters.length > 0) {
                    return ''; // Don't show movies with no matching showtimes
                }

                return `
                    <div class="movie-row ${isPreselected ? 'highlighted' : ''}">
                        <div class="movie-row-poster">
                            <img src="${poster}" alt="${movie.title}" onerror="this.src='${DEFAULT_POSTER}'">
                        </div>
                        <div class="movie-row-info">
                            <h4>${movie.title}${isPreselected ? ' <span class="preselected-badge">Your Selection</span>' : ''}</h4>
                            <p class="movie-meta">${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} ★ • ${movie.release_date ? new Date(movie.release_date).getFullYear() : ''}</p>
                            <div class="showtimes">
                                ${filteredShowtimes.map(session => `
                                    <button class="showtime-btn ${session.features.length > 0 ? 'has-features' : ''}"
                                            onclick="BookingManager.selectShowtime(${movie.id}, '${movie.title.replace(/'/g, "\\'")}', '${poster}', '${session.time}', '${session.features.join(',')}')"
                                            data-features="${session.features.join(',')}">
                                        <span class="showtime-time">${session.time}</span>
                                        ${session.features.length > 0 ? `
                                            <span class="showtime-features">
                                                ${session.features.map(f => `<span class="feature-tag ${f}">${SessionFeatures[f]?.icon || f.toUpperCase()}</span>`).join('')}
                                            </span>
                                        ` : ''}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Failed to load movies:', error);
            moviesGrid.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Failed to load movies. Please try again.</p>';
        }
    },

    // Generate showtimes with session features (CC, AD, 3D, IMAX, Dolby)
    generateShowtimesWithFeatures(allTimes) {
        // Filter out past showtimes if selected date is today
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const isToday = this.state.selectedDate === today;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        // Filter times - only show future showtimes for today
        let availableTimes = allTimes;
        if (isToday) {
            availableTimes = allTimes.filter(time => {
                const timeMinutes = this.parseTime(time);
                // Add 15 minute buffer - don't show sessions starting in less than 15 mins
                return timeMinutes > currentMinutes + 15;
            });
        }

        // If no times available for today, return empty
        if (availableTimes.length === 0) {
            return [];
        }

        const count = Math.min(4 + Math.floor(Math.random() * 3), availableTimes.length); // 4-6 showtimes or less
        const shuffled = [...availableTimes].sort(() => 0.5 - Math.random());
        const selectedTimes = shuffled.slice(0, count);

        // Define which features each session can have
        const possibleFeatures = ['cc', 'ad', '3d', 'imax', 'dolby'];

        return selectedTimes.map(time => {
            const features = [];

            // 40% chance of having CC
            if (Math.random() < 0.4) features.push('cc');
            // 30% chance of having AD
            if (Math.random() < 0.3) features.push('ad');
            // 25% chance of being 3D (but not with IMAX)
            if (Math.random() < 0.25 && !features.includes('imax')) features.push('3d');
            // 20% chance of being IMAX (but not with 3D)
            if (Math.random() < 0.2 && !features.includes('3d')) features.push('imax');
            // 35% chance of having Dolby Atmos
            if (Math.random() < 0.35) features.push('dolby');

            return { time, features };
        }).sort((a, b) => {
            const timeA = this.parseTime(a.time);
            const timeB = this.parseTime(b.time);
            return timeA - timeB;
        });
    },

    // Filter showtimes based on active filters
    filterShowtimes(showtimes) {
        if (this.state.activeFilters.length === 0) {
            return showtimes;
        }

        return showtimes.filter(session => {
            // Check if session has ALL selected filters
            return this.state.activeFilters.every(filter => session.features.includes(filter));
        });
    },

    parseTime(timeStr) {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
    },

    // Showtime selection handler
    selectShowtime(movieId, movieTitle, moviePoster, time, featuresStr = '') {
        this.state.selectedMovie = {
            id: movieId,
            title: movieTitle,
            poster: moviePoster
        };
        this.state.selectedShowtime = time;
        this.state.selectedSessionType = featuresStr ? featuresStr.split(',').filter(f => f) : [];

        // Reset ticket counts
        this.state.tickets = { adult: 0, concession: 0, child: 0, family: 0 };
        document.querySelectorAll('.ticket-type-count').forEach(el => el.textContent = '0');

        // Update summary
        document.getElementById('summary-poster').src = moviePoster;
        document.getElementById('summary-title').textContent = movieTitle;
        document.getElementById('summary-cinema').textContent = this.state.selectedCinema.name;

        const dateObj = new Date(this.state.selectedDate);
        const dateStr = dateObj.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });

        // Build session info string
        let sessionInfo = `${dateStr} at ${time}`;
        if (this.state.selectedSessionType.length > 0) {
            const featureNames = this.state.selectedSessionType
                .map(f => SessionFeatures[f]?.name || f.toUpperCase())
                .join(' • ');
            sessionInfo += ` • ${featureNames}`;
        }
        document.getElementById('summary-datetime').textContent = sessionInfo;

        this.updatePrice();

        // Show summary step
        document.getElementById('step-summary').style.display = 'block';
        setTimeout(() => {
            document.getElementById('step-summary').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    },

    // Adjust ticket count by type
    adjustTicketType(type, delta) {
        const newCount = this.state.tickets[type] + delta;
        if (newCount >= 0 && newCount <= 10) {
            this.state.tickets[type] = newCount;
            document.getElementById(`count-${type}`).textContent = newCount;
            this.updatePrice();
        }
    },

    // Calculate premium format surcharge
    getPremiumSurcharge() {
        let surcharge = 0;
        const sessionTypes = this.state.selectedSessionType || [];

        sessionTypes.forEach(type => {
            if (SessionFeatures[type]?.priceAdd) {
                surcharge += SessionFeatures[type].priceAdd;
            }
        });

        return surcharge;
    },

    // Get total ticket count
    getTotalTickets() {
        const t = this.state.tickets;
        // Family = 4 people
        return t.adult + t.concession + t.child + (t.family * 4);
    },

    // Update price display with breakdown
    updatePrice() {
        const t = this.state.tickets;
        const surcharge = this.getPremiumSurcharge();
        let total = 0;
        let breakdown = [];

        // Calculate each ticket type
        if (t.adult > 0) {
            const price = (TicketPrices.adult + surcharge) * t.adult;
            total += price;
            breakdown.push(`${t.adult}x Adult @ $${(TicketPrices.adult + surcharge).toFixed(2)} = $${price.toFixed(2)}`);
        }
        if (t.concession > 0) {
            const price = (TicketPrices.concession + surcharge) * t.concession;
            total += price;
            breakdown.push(`${t.concession}x Concession @ $${(TicketPrices.concession + surcharge).toFixed(2)} = $${price.toFixed(2)}`);
        }
        if (t.child > 0) {
            const price = (TicketPrices.child + surcharge) * t.child;
            total += price;
            breakdown.push(`${t.child}x Child @ $${(TicketPrices.child + surcharge).toFixed(2)} = $${price.toFixed(2)}`);
        }
        if (t.family > 0) {
            const price = (TicketPrices.family + (surcharge * 4)) * t.family; // Surcharge applies to all 4 people
            total += price;
            breakdown.push(`${t.family}x Family @ $${(TicketPrices.family + (surcharge * 4)).toFixed(2)} = $${price.toFixed(2)}`);
        }

        // Update total display
        document.getElementById('total-price').textContent = total.toFixed(2);

        // Update breakdown
        const summaryEl = document.getElementById('ticket-summary');
        const breakdownEl = document.getElementById('ticket-breakdown');

        if (breakdown.length > 0) {
            breakdownEl.innerHTML = breakdown.map(line => `<p>${line}</p>`).join('');
            if (surcharge > 0) {
                const featureNames = (this.state.selectedSessionType || [])
                    .filter(f => SessionFeatures[f]?.priceAdd)
                    .map(f => SessionFeatures[f].name)
                    .join(' + ');
                breakdownEl.innerHTML += `<p class="surcharge-note">Includes ${featureNames} surcharge (+$${surcharge.toFixed(2)}/ticket)</p>`;
            }
            summaryEl.style.display = 'block';
        } else {
            summaryEl.style.display = 'none';
        }
    },

    // Confirm booking
    confirmBooking() {
        const totalTickets = this.getTotalTickets();

        // Validate at least one ticket selected
        if (totalTickets === 0) {
            alert('Please select at least one ticket.');
            return;
        }

        const surcharge = this.getPremiumSurcharge();
        const t = this.state.tickets;

        // Calculate total
        let total = 0;
        if (t.adult > 0) total += (TicketPrices.adult + surcharge) * t.adult;
        if (t.concession > 0) total += (TicketPrices.concession + surcharge) * t.concession;
        if (t.child > 0) total += (TicketPrices.child + surcharge) * t.child;
        if (t.family > 0) total += (TicketPrices.family + (surcharge * 4)) * t.family;

        // Build ticket description
        const ticketParts = [];
        if (t.adult > 0) ticketParts.push(`${t.adult} Adult`);
        if (t.concession > 0) ticketParts.push(`${t.concession} Concession`);
        if (t.child > 0) ticketParts.push(`${t.child} Child`);
        if (t.family > 0) ticketParts.push(`${t.family} Family`);

        const booking = {
            movieId: this.state.selectedMovie.id,
            movieTitle: this.state.selectedMovie.title,
            moviePoster: this.state.selectedMovie.poster,
            cinema: this.state.selectedCinema.name,
            location: this.state.selectedCinema.address,
            state: CinemaData[this.state.selectedState].name,
            city: CinemaData[this.state.selectedState].cities[this.state.selectedCity].name,
            date: this.state.selectedDate,
            time: this.state.selectedShowtime,
            tickets: { ...this.state.tickets },
            ticketDescription: ticketParts.join(', '),
            totalTickets: totalTickets,
            totalPrice: total,
            sessionTypes: this.state.selectedSessionType || []
        };

        // Save booking using BookingsManager from bookings.js
        if (window.BookingsManager) {
            const savedBooking = window.BookingsManager.add(booking);

            // Show custom modal instead of alert
            this.showBookingModal(booking, savedBooking.id);
        } else {
            alert('Booking system unavailable. Please try again.');
        }
    },

    // Show booking confirmation modal
    showBookingModal(booking, bookingId) {
        const dateStr = new Date(booking.date).toLocaleDateString('en-AU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });

        // Populate modal content
        document.getElementById('modal-movie').textContent = booking.movieTitle;
        document.getElementById('modal-cinema').textContent = booking.cinema;
        document.getElementById('modal-date').textContent = dateStr;
        document.getElementById('modal-time').textContent = booking.time;
        document.getElementById('modal-tickets').textContent = booking.ticketDescription;
        document.getElementById('modal-total').textContent = `$${booking.totalPrice.toFixed(2)}`;
        document.getElementById('modal-booking-id').textContent = bookingId;

        // Show session type if any
        const sessionRow = document.getElementById('modal-session-row');
        if (booking.sessionTypes && booking.sessionTypes.length > 0) {
            const sessionNames = booking.sessionTypes
                .map(f => SessionFeatures[f]?.name || f.toUpperCase())
                .join(', ');
            document.getElementById('modal-session').textContent = sessionNames;
            sessionRow.style.display = 'flex';
        } else {
            sessionRow.style.display = 'none';
        }

        // Show modal
        const overlay = document.getElementById('booking-modal-overlay');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    // Close modal and redirect to account page
    closeModalAndRedirect() {
        this.closeModal();
        window.location.href = 'account.html';
    },

    // Close modal and reset for another booking
    closeModal() {
        const overlay = document.getElementById('booking-modal-overlay');
        overlay.classList.remove('active');
        document.body.style.overflow = '';

        // Reset booking state for another booking
        this.state.selectedShowtime = null;
        this.state.selectedSessionType = null;
        this.state.tickets = { adult: 0, concession: 0, child: 0, family: 0 };
        document.querySelectorAll('.ticket-type-count').forEach(el => el.textContent = '0');
        document.getElementById('total-price').textContent = '0.00';
        document.getElementById('ticket-summary').style.display = 'none';
        document.getElementById('step-summary').style.display = 'none';
    },

    // Hide empty state
    hideEmptyState() {
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    BookingManager.init();
});
