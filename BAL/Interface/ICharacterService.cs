﻿using Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BAL.Interface
{
    public interface ICharacterService
    {
        Task<List<Character>?> GetCharactersAsync();
    }
}
