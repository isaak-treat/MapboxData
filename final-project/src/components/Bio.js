import React from 'react';

export default function Bio() {

    let bios = [
        {
            'name': "Isaak Treat",
            'git': "https://github.com/isaak-treat"
        },
        {
            'name': "Harrison Edward Gerber",
            'git': "https://github.com/kingneo77"
        },
        {
            'name': "Marshall Allshouse",
            'git': "https://github.com/MarshallAllshouseUCCS"
        },
        {
            'name': "Connor F",
            'git': "https://github.com/hadhog75"
        },
        {
            'name': "Ahmad passionfruity",
            'git': "https://github.com/gulgarcon"
        }
    ]


      return (
        <div className="Bio">
            <div className="Bio-info">
                <h1>
                    Eathquake Data
                </h1>
                <p>
                    Current Earthquake Data recorded in the past 30 days, provided by Mapbox.
                </p>
            </div>
            <br />
            <div className="Bio-dev">
                <h1>
                    Development Team
                </h1>
            </div>
            <ul className="Bio-list">
                {bios.map(bio => {
                    return (
                        <a className="Bio-names" href={bio.git}>
                            <li id={bio.name}>{bio.name}</li>
                        </a>
                    )
                })}
            </ul>
        </div>
        
      );
}