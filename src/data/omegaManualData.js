
export const OMEGA_MANUAL_PROBLEMS = [
  // 1. Vertical + Staff + Sword (Out + Out -> Out-N/S)
  {
    id: "p1_v_staff_sword",
    title: "Vertical / Staff & Sword",
    description: "Out + Out => Safe Outer North/South",
    frames: [
      {
        units: [
          { position: 'center', type: 'Vertical' },
          { position: 'ne', type: 'F-Staff' },
          { position: 'sw', type: 'M-Sword' }
        ],
        correctSpots: ['m_out_n', 'm_out_s']
      },
      {
        units: [
          { position: 'center', type: 'Vertical' },
          { position: 'nw', type: 'F-Staff' },
          { position: 'se', type: 'M-Sword' }
        ],
        correctSpots: ['m_out_n', 'm_out_s']
      }
    ]
  },
  // 2. Vertical + Staff + Shield (Out + In -> In-N/S)
  {
    id: "p2_v_staff_shield",
    title: "Vertical / Staff & Shield",
    description: "Out + In => Safe Inner North/South",
    frames: [
      {
        units: [
          { position: 'center', type: 'Vertical' },
          { position: 'se', type: 'F-Staff' },
          { position: 'nw', type: 'M-Shield' }
        ],
        correctSpots: ['m_in_n', 'm_in_s']
      },
      {
        units: [
          { position: 'center', type: 'Vertical' },
          { position: 'sw', type: 'F-Staff' },
          { position: 'ne', type: 'M-Shield' }
        ],
        correctSpots: ['m_in_n', 'm_in_s']
      }
    ]
  },
  // 3. Vertical + Legs + Sword (In + Out -> Center F-Side)
  {
    id: "p3_v_legs_sword",
    title: "Vertical / Legs & Sword",
    description: "In + Out => Center (F Side)",
    frames: [
      {
        units: [
          { position: 'center', type: 'Vertical' },
          { position: 'ne', type: 'F-Legs' }, // F is North-East -> North
          { position: 'sw', type: 'M-Sword' }
        ],
        correctSpots: ['c_n']
      },
      {
        units: [
          { position: 'center', type: 'Vertical' },
          { position: 'sw', type: 'F-Legs' }, // F is South-West -> South
          { position: 'ne', type: 'M-Sword' }
        ],
        correctSpots: ['c_s']
      }
    ]
  },
  // 4. Vertical + Legs + Shield (In + In -> Center M-Side)
  {
    id: "p4_v_legs_shield",
    title: "Vertical / Legs & Shield",
    description: "In + In => Center (M Side)",
    frames: [
      {
        units: [
          { position: 'center', type: 'Vertical' },
          { position: 'nw', type: 'F-Legs' },
          { position: 'se', type: 'M-Shield' } // M is South-East -> South
        ],
        correctSpots: ['c_s']
      },
      {
        units: [
          { position: 'center', type: 'Vertical' },
          { position: 'se', type: 'F-Legs' },
          { position: 'nw', type: 'M-Shield' } // M is North-West -> North
        ],
        correctSpots: ['c_n']
      }
    ]
  },
  // 5. Horizontal + Staff + Sword (Out + Out -> Out-E/W)
  {
    id: "p5_h_staff_sword",
    title: "Horizontal / Staff & Sword",
    description: "Out + Out => Safe Outer East/West",
    frames: [
      {
        units: [
          { position: 'center', type: 'Horizontal' },
          { position: 'ne', type: 'F-Staff' },
          { position: 'sw', type: 'M-Sword' }
        ],
        correctSpots: ['m_out_e', 'm_out_w']
      },
      {
        units: [
          { position: 'center', type: 'Horizontal' },
          { position: 'sw', type: 'F-Staff' },
          { position: 'ne', type: 'M-Sword' }
        ],
        correctSpots: ['m_out_e', 'm_out_w']
      }
    ]
  },
  // 6. Horizontal + Staff + Shield (Out + In -> In-E/W)
  {
    id: "p6_h_staff_shield",
    title: "Horizontal / Staff & Shield",
    description: "Out + In => Safe Inner East/West",
    frames: [
      {
        units: [
          { position: 'center', type: 'Horizontal' },
          { position: 'nw', type: 'F-Staff' },
          { position: 'se', type: 'M-Shield' }
        ],
        correctSpots: ['m_in_e', 'm_in_w']
      },
      {
        units: [
          { position: 'center', type: 'Horizontal' },
          { position: 'se', type: 'F-Staff' },
          { position: 'nw', type: 'M-Shield' }
        ],
        correctSpots: ['m_in_e', 'm_in_w']
      }
    ]
  },
  // 7. Horizontal + Legs + Sword (In + Out -> Center F-Side)
  {
    id: "p7_h_legs_sword",
    title: "Horizontal / Legs & Sword",
    description: "In + Out => Center (F Side)",
    frames: [
      {
        units: [
          { position: 'center', type: 'Horizontal' },
          { position: 'ne', type: 'F-Legs' }, // F is North-East -> East
          { position: 'sw', type: 'M-Sword' }
        ],
        correctSpots: ['c_e']
      },
      {
        units: [
          { position: 'center', type: 'Horizontal' },
          { position: 'nw', type: 'F-Legs' }, // F is North-West -> West
          { position: 'se', type: 'M-Sword' }
        ],
        correctSpots: ['c_w']
      }
    ]
  },
  // 8. Horizontal + Legs + Shield (In + In -> Center M-Side)
  {
    id: "p8_h_legs_shield",
    title: "Horizontal / Legs & Shield",
    description: "In + In => Center (M Side)",
    frames: [
      {
        units: [
          { position: 'center', type: 'Horizontal' },
          { position: 'sw', type: 'F-Legs' },
          { position: 'ne', type: 'M-Shield' } // M is North-East -> East
        ],
        correctSpots: ['c_e']
      },
      {
        units: [
          { position: 'center', type: 'Horizontal' },
          { position: 'se', type: 'F-Legs' },
          { position: 'nw', type: 'M-Shield' } // M is North-West -> West
        ],
        correctSpots: ['c_w']
      }
    ]
  }
];
